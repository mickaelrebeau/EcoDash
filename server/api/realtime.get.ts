import {
    getDataSourceConfig,
    fetchShellyData,
    fetchHomeAssistantData,
    generateSimulationData
} from '../utils/dataSources'

export default defineEventHandler(async (event) => {
    const config = getDataSourceConfig()

    if (!config.enabled) {
        return {
            success: false,
            error: 'Real-time data source is disabled',
            source: 'none'
        }
    }

    const timestamp = new Date().toISOString()

    try {
        switch (config.type) {
            case 'shelly': {
                const shellyConfig = config.config as { ip: string; channel?: number }
                const data = await fetchShellyData(shellyConfig)
                if (!data) {
                    return {
                        success: false,
                        error: 'Failed to connect to Shelly device',
                        source: 'shelly'
                    }
                }
                return {
                    success: true,
                    source: 'shelly',
                    timestamp,
                    data: {
                        power: data.power, // Watts
                        powerKw: Number((data.power / 1000).toFixed(3)),
                        voltage: data.voltage,
                        current: data.current,
                        totalKwh: data.total
                    }
                }
            }

            case 'homeassistant': {
                const haConfig = config.config as { url: string; token: string; entityId: string }
                const data = await fetchHomeAssistantData(haConfig)
                if (!data) {
                    return {
                        success: false,
                        error: 'Failed to connect to Home Assistant',
                        source: 'homeassistant'
                    }
                }

                // Convert to Watts if needed
                let powerW = data.power
                if (data.unit === 'kW') powerW = data.power * 1000

                return {
                    success: true,
                    source: 'homeassistant',
                    timestamp,
                    data: {
                        power: powerW,
                        powerKw: Number((powerW / 1000).toFixed(3)),
                        voltage: 230,
                        current: Number((powerW / 230).toFixed(2)),
                        rawState: data.state,
                        rawUnit: data.unit
                    }
                }
            }

            case 'simulation':
            default: {
                const data = generateSimulationData()
                return {
                    success: true,
                    source: 'simulation',
                    timestamp,
                    data: {
                        power: data.power,
                        powerKw: Number((data.power / 1000).toFixed(3)),
                        voltage: data.voltage,
                        current: data.current
                    }
                }
            }
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            source: config.type
        }
    }
})
