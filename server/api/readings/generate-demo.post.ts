import db from '../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const days = body.days || 90
    const clearExisting = body.clearExisting ?? true

    if (clearExisting) {
        db.prepare('DELETE FROM readings').run()
    }

    const readings: any[] = []
    const now = new Date()

    // French household consumption patterns (kWh per hour)
    // Based on actual ADEME/RTE data for typical French home
    const hourlyPatterns: Record<number, number> = {
        0: 0.3,  // Night - base load (fridge, router, standby)
        1: 0.25,
        2: 0.2,
        3: 0.2,
        4: 0.2,
        5: 0.25,
        6: 0.5,  // Morning wake up
        7: 1.2,  // Morning peak (shower, breakfast)
        8: 0.8,
        9: 0.5,  // Most people at work
        10: 0.4,
        11: 0.4,
        12: 0.7, // Lunch
        13: 0.5,
        14: 0.4,
        15: 0.4,
        16: 0.5,
        17: 0.8,
        18: 1.5, // Evening peak start
        19: 2.0, // Cooking dinner
        20: 1.8, // TV, lights
        21: 1.5,
        22: 1.0,
        23: 0.5
    }

    // Seasonal factors (France)
    const getSeasonalFactor = (month: number): number => {
        // Winter months have higher consumption (heating)
        const factors: Record<number, number> = {
            0: 1.4,  // January
            1: 1.35, // February
            2: 1.2,  // March
            3: 1.0,  // April
            4: 0.85, // May
            5: 0.8,  // June
            6: 0.75, // July
            7: 0.75, // August
            8: 0.85, // September
            9: 1.0,  // October
            10: 1.2, // November
            11: 1.4  // December
        }
        return factors[month] || 1.0
    }

    // Weekend factor (less consumption on weekends in general, but different pattern)
    const getWeekendFactor = (day: number, hour: number): number => {
        if (day === 0 || day === 6) { // Sunday or Saturday
            // More consumption during day on weekends
            if (hour >= 10 && hour <= 18) return 1.3
            return 0.9
        }
        return 1.0
    }

    // Generate hourly readings for each day
    for (let d = days; d >= 0; d--) {
        for (let h = 0; h < 24; h++) {
            const date = new Date(now)
            date.setDate(date.getDate() - d)
            date.setHours(h, 0, 0, 0)

            const month = date.getMonth()
            const dayOfWeek = date.getDay()

            const baseConsumption = hourlyPatterns[h]
            const seasonalFactor = getSeasonalFactor(month)
            const weekendFactor = getWeekendFactor(dayOfWeek, h)

            // Add some randomness (±15%)
            const randomFactor = 0.85 + Math.random() * 0.30

            // Occasional spikes (washing machine, oven, etc.) - 10% chance
            const spikeFactor = Math.random() < 0.1 ? 1.5 + Math.random() : 1.0

            const value = baseConsumption * seasonalFactor * weekendFactor * randomFactor * spikeFactor

            readings.push({
                timestamp: date.toISOString(),
                type: 'electricity',
                value: Number(value.toFixed(3)),
                unit: 'kWh',
                source: 'demo'
            })
        }
    }

    // Insert all readings
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
    const avgDaily = totalKwh / days

    return {
        success: true,
        message: `Generated ${readings.length} realistic readings for ${days} days`,
        summary: {
            totalReadings: readings.length,
            totalKwh: Number(totalKwh.toFixed(2)),
            avgDailyKwh: Number(avgDaily.toFixed(2)),
            estimatedMonthlyCost: Number((avgDaily * 30 * 0.2516).toFixed(2)),
            dateRange: {
                from: readings[0].timestamp,
                to: readings[readings.length - 1].timestamp
            }
        }
    }
})
