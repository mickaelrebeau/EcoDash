import { getDataSourceConfig, saveDataSourceConfig } from '../utils/dataSources'

export default defineEventHandler(async (event) => {
    const method = event.method

    if (method === 'GET') {
        const config = getDataSourceConfig()
        return {
            success: true,
            data: config
        }
    }

    if (method === 'PUT') {
        const body = await readBody(event)

        // Validate config
        const validTypes = ['simulation', 'shelly', 'homeassistant', 'enedis']
        if (!validTypes.includes(body.type)) {
            throw createError({
                statusCode: 400,
                message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            })
        }

        // Test connection before saving (optional)
        if (body.testConnection) {
            try {
                if (body.type === 'shelly') {
                    const { fetchShellyData } = await import('../utils/dataSources')
                    const result = await fetchShellyData(body.config)
                    if (!result) {
                        throw createError({
                            statusCode: 400,
                            message: 'Cannot connect to Shelly device. Check IP address and network.'
                        })
                    }
                }

                if (body.type === 'homeassistant') {
                    const { fetchHomeAssistantData } = await import('../utils/dataSources')
                    const result = await fetchHomeAssistantData(body.config)
                    if (!result) {
                        throw createError({
                            statusCode: 400,
                            message: 'Cannot connect to Home Assistant. Check URL, token, and entity ID.'
                        })
                    }
                }
            } catch (error: any) {
                throw createError({
                    statusCode: 400,
                    message: `Connection test failed: ${error.message}`
                })
            }
        }

        const newConfig = {
            type: body.type,
            enabled: body.enabled ?? true,
            config: body.config || {}
        }

        saveDataSourceConfig(newConfig)

        return {
            success: true,
            message: 'Data source configuration saved',
            data: newConfig
        }
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
