import db from '../utils/db'

interface DataSourceConfig {
    type: 'simulation' | 'enedis' | 'shelly' | 'homeassistant'
    enabled: boolean
    config: Record<string, any>
}

// Get current data source configuration
export function getDataSourceConfig(): DataSourceConfig {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'data_source'").get() as any
    if (row?.value) {
        try {
            return JSON.parse(row.value)
        } catch {
            return { type: 'simulation', enabled: true, config: {} }
        }
    }
    return { type: 'simulation', enabled: true, config: {} }
}

// Save data source configuration
export function saveDataSourceConfig(config: DataSourceConfig): void {
    db.prepare(`
    INSERT INTO settings (key, value, updated_at) 
    VALUES ('data_source', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `).run(JSON.stringify(config), JSON.stringify(config))
}

// Fetch data from Shelly EM device (local network)
export async function fetchShellyData(config: { ip: string; channel?: number }): Promise<{
    power: number // Watts
    voltage: number
    current: number
    total: number // kWh total
} | null> {
    try {
        const response = await fetch(`http://${config.ip}/status`, {
            signal: AbortSignal.timeout(5000)
        })

        if (!response.ok) throw new Error('Shelly not responding')

        const data = await response.json()
        const channel = config.channel || 0
        const meter = data.emeters?.[channel] || data.meters?.[channel]

        if (!meter) throw new Error('No meter data found')

        return {
            power: meter.power || 0,
            voltage: meter.voltage || 230,
            current: meter.current || (meter.power / 230),
            total: (meter.total || 0) / 1000 // Wh to kWh
        }
    } catch (error) {
        console.error('[Shelly] Fetch error:', error)
        return null
    }
}

// Fetch data from Home Assistant
export async function fetchHomeAssistantData(config: {
    url: string
    token: string
    entityId: string
}): Promise<{
    power: number
    state: string
    unit: string
} | null> {
    try {
        const response = await fetch(`${config.url}/api/states/${config.entityId}`, {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
        })

        if (!response.ok) throw new Error('Home Assistant API error')

        const data = await response.json()

        return {
            power: parseFloat(data.state) || 0,
            state: data.state,
            unit: data.attributes?.unit_of_measurement || 'W'
        }
    } catch (error) {
        console.error('[HomeAssistant] Fetch error:', error)
        return null
    }
}

// Fetch data from Enedis Data-Connect (requires OAuth token)
export async function fetchEnedisData(config: {
    accessToken: string
    usagePointId: string
}): Promise<{
    consumption: number
    date: string
} | null> {
    try {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const startDate = yesterday.toISOString().slice(0, 10)
        const endDate = new Date().toISOString().slice(0, 10)

        const response = await fetch(
            `https://ext.prod-sandbox.api.enedis.fr/metering_data_clc/v4/daily_consumption?start=${startDate}&end=${endDate}&usage_point_id=${config.usagePointId}`,
            {
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            }
        )

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Enedis API error: ${error}`)
        }

        const data = await response.json()
        const readings = data.meter_reading?.interval_reading || []

        if (readings.length === 0) return null

        const latest = readings[readings.length - 1]
        return {
            consumption: parseFloat(latest.value) / 1000, // Wh to kWh
            date: latest.date
        }
    } catch (error) {
        console.error('[Enedis] Fetch error:', error)
        return null
    }
}

// Generate simulation data (fallback/demo mode)
export function generateSimulationData(): {
    power: number
    voltage: number
    current: number
} {
    const now = new Date()
    const hour = now.getHours()

    // Realistic consumption pattern
    let basePower = 200 // Base load in Watts

    if (hour >= 7 && hour <= 9) basePower = 2500 // Morning
    else if (hour >= 12 && hour <= 14) basePower = 1500 // Lunch
    else if (hour >= 18 && hour <= 22) basePower = 3500 // Evening peak
    else if (hour >= 23 || hour <= 6) basePower = 300 // Night
    else basePower = 800 // Day

    // Add randomness
    const noise = (Math.random() - 0.5) * 500
    const power = Math.max(100, basePower + noise)
    const voltage = 230 + (Math.random() - 0.5) * 5

    return {
        power: Number(power.toFixed(0)),
        voltage: Number(voltage.toFixed(1)),
        current: Number((power / voltage).toFixed(2))
    }
}
