import db from '../../utils/db'
import { parse } from 'csv-parse/sync'

// Supported formats and their configurations
const FORMAT_CONFIGS: Record<string, {
    delimiter: string
    dateColumns: string[]
    valueColumns: string[]
    timeColumn?: string
    valueMultiplier?: number
    skipLines?: number
}> = {
    // Enedis / Linky standard export
    linky: {
        delimiter: ';',
        dateColumns: ['Date', 'Horodate', 'date', 'Date de début'],
        valueColumns: ['Valeur', 'Consommation (Wh)', 'value', 'Valeur (en Wh)'],
        timeColumn: 'Heure',
        valueMultiplier: 0.001 // Wh to kWh
    },

    // Enedis detailed export
    enedis: {
        delimiter: ';',
        dateColumns: ['Horodate', 'Date et heure de début de la mesure'],
        valueColumns: ['Valeur', 'Valeur (en Wh)', 'Consommation (Wh)'],
        valueMultiplier: 0.001
    },

    // TotalEnergies export format
    totalenergies: {
        delimiter: ';',
        dateColumns: ['Date', 'Date de relevé', 'Période'],
        valueColumns: ['Consommation (kWh)', 'Conso. (kWh)', 'Quantité', 'Index'],
        valueMultiplier: 1 // Already in kWh
    },

    // EDF export format
    edf: {
        delimiter: ';',
        dateColumns: ['Date', 'Date de consommation', 'Période de consommation'],
        valueColumns: ['Consommation (kWh)', 'Energie consommée (kWh)', 'Quantité (kWh)'],
        timeColumn: 'Heure',
        valueMultiplier: 1
    },

    // EDF detailed (30-min intervals)
    edf_detail: {
        delimiter: ';',
        dateColumns: ['Horodatage', 'Date/Heure'],
        valueColumns: ['Puissance moyenne (W)', 'Puissance (W)', 'Consommation (Wh)'],
        valueMultiplier: 0.001 // W or Wh to kWh
    },

    // Generic CSV format
    generic: {
        delimiter: ',',
        dateColumns: ['date', 'Date', 'datetime', 'timestamp', 'Timestamp'],
        valueColumns: ['value', 'Value', 'consumption', 'kWh', 'kwh', 'Consommation'],
        valueMultiplier: 1
    }
}

// Helper to find column value from possible names
function findColumnValue(row: any, possibleNames: string[]): string | undefined {
    for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== '') {
            return row[name]
        }
    }
    return undefined
}

// Parse date from various formats
function parseDate(dateStr: string, timeStr?: string): Date | null {
    if (!dateStr) return null

    // Clean the string
    dateStr = dateStr.trim()

    // Try ISO format first
    if (dateStr.includes('T')) {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) return d
    }

    // French format: DD/MM/YYYY or DD-MM-YYYY
    const frenchMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(.*)$/)
    if (frenchMatch) {
        const [_, day, month, year, rest] = frenchMatch
        let hours = '00', minutes = '00'

        // Check for time in the same string
        const timeMatch = rest.match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
            hours = timeMatch[1]
            minutes = timeMatch[2]
        } else if (timeStr) {
            const tm = timeStr.match(/(\d{1,2}):(\d{2})/)
            if (tm) {
                hours = tm[1]
                minutes = tm[2]
            }
        }

        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
        )
    }

    // US format: YYYY-MM-DD
    const usMatch = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(.*)$/)
    if (usMatch) {
        const [_, year, month, day, rest] = usMatch
        let hours = '00', minutes = '00'

        const timeMatch = rest.match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
            hours = timeMatch[1]
            minutes = timeMatch[2]
        } else if (timeStr) {
            const tm = timeStr.match(/(\d{1,2}):(\d{2})/)
            if (tm) {
                hours = tm[1]
                minutes = tm[2]
            }
        }

        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
        )
    }

    // Last resort: let JavaScript parse it
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d

    return null
}

// Parse numeric value (handles French comma notation)
function parseNumericValue(value: string): number {
    if (!value) return NaN
    // Replace comma with dot and remove spaces
    const cleaned = String(value).replace(',', '.').replace(/\s/g, '')
    return parseFloat(cleaned)
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.data) {
        throw createError({ statusCode: 400, message: 'No CSV data provided' })
    }

    const format = body.format || 'linky'
    const config = FORMAT_CONFIGS[format]

    if (!config) {
        throw createError({
            statusCode: 400,
            message: `Unknown format: ${format}. Supported: ${Object.keys(FORMAT_CONFIGS).join(', ')}`
        })
    }

    try {
        let csvData = body.data

        // Skip header lines if needed (some exports have metadata at the top)
        if (config.skipLines) {
            const lines = csvData.split('\n')
            csvData = lines.slice(config.skipLines).join('\n')
        }

        // Try to auto-detect delimiter if parsing fails
        let records: any[]
        try {
            records = parse(csvData, {
                delimiter: config.delimiter,
                columns: true,
                skip_empty_lines: true,
                relaxColumnCount: true,
                trim: true
            })
        } catch {
            // Try with comma delimiter
            records = parse(csvData, {
                delimiter: config.delimiter === ';' ? ',' : ';',
                columns: true,
                skip_empty_lines: true,
                relaxColumnCount: true,
                trim: true
            })
        }

        if (records.length === 0) {
            throw createError({ statusCode: 400, message: 'No valid records found in CSV' })
        }

        // Log first record for debugging
        console.log(`[Import ${format}] First record:`, records[0])
        console.log(`[Import ${format}] Total records: ${records.length}`)

        const readings: any[] = []
        const errors: string[] = []

        for (let i = 0; i < records.length; i++) {
            const row = records[i]

            // Find date
            const dateStr = findColumnValue(row, config.dateColumns)
            if (!dateStr) {
                if (i < 5) errors.push(`Row ${i + 1}: No date found`)
                continue
            }

            // Find time if separate column
            const timeStr = config.timeColumn ? row[config.timeColumn] : undefined

            // Parse date
            const date = parseDate(dateStr, timeStr)
            if (!date) {
                if (errors.length < 10) errors.push(`Row ${i + 1}: Invalid date "${dateStr}"`)
                continue
            }

            // Find value
            const valueStr = findColumnValue(row, config.valueColumns)
            if (!valueStr) {
                if (errors.length < 10) errors.push(`Row ${i + 1}: No value found`)
                continue
            }

            // Parse value
            let value = parseNumericValue(valueStr)
            if (isNaN(value) || value < 0) {
                if (errors.length < 10) errors.push(`Row ${i + 1}: Invalid value "${valueStr}"`)
                continue
            }

            // Apply multiplier (e.g., Wh to kWh)
            value = value * (config.valueMultiplier || 1)

            // Skip zero or very small values
            if (value < 0.001) continue

            readings.push({
                timestamp: date.toISOString(),
                type: 'electricity',
                value: Number(value.toFixed(3)),
                unit: 'kWh',
                source: format
            })
        }

        if (readings.length === 0) {
            throw createError({
                statusCode: 400,
                message: `No valid readings could be extracted. Errors: ${errors.slice(0, 5).join('; ')}`
            })
        }

        // Sort by timestamp
        readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        // Insert into database
        const insert = db.prepare(`
      INSERT INTO readings (timestamp, type, value, unit, source)
      VALUES (?, ?, ?, ?, ?)
    `)

        const insertMany = db.transaction((items: typeof readings) => {
            for (const item of items) {
                insert.run(item.timestamp, item.type, item.value, item.unit, item.source)
            }
        })

        insertMany(readings)

        // Calculate summary
        const totalKwh = readings.reduce((sum, r) => sum + r.value, 0)
        const firstDate = new Date(readings[0].timestamp)
        const lastDate = new Date(readings[readings.length - 1].timestamp)
        const days = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) || 1

        return {
            success: true,
            message: `${readings.length} relevés importés depuis ${format.toUpperCase()}`,
            summary: {
                count: readings.length,
                totalKwh: Number(totalKwh.toFixed(2)),
                avgDailyKwh: Number((totalKwh / days).toFixed(2)),
                dateRange: {
                    from: firstDate.toISOString(),
                    to: lastDate.toISOString(),
                    days
                }
            },
            warnings: errors.length > 0 ? errors.slice(0, 5) : undefined
        }

    } catch (error: any) {
        console.error('[Import Error]', error)
        throw createError({
            statusCode: 400,
            message: `Erreur d'import: ${error.message || error}`
        })
    }
})
