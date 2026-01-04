export interface RealtimeData {
    timestamp: string
    power: number      // Watts
    powerKw: number    // kW
    voltage: number    // V
    current: number    // A
    source: string
    totalKwh?: number
}

export interface RealtimeState {
    isConnected: boolean
    isLoading: boolean
    error: string | null
    source: string
    lastUpdate: string | null
}

export const useRealtime = () => {
    const data = ref<RealtimeData | null>(null)
    const state = ref<RealtimeState>({
        isConnected: false,
        isLoading: false,
        error: null,
        source: 'none',
        lastUpdate: null
    })

    let intervalId: ReturnType<typeof setInterval> | null = null
    const pollInterval = ref(2000) // 2 seconds default

    const fetchData = async () => {
        state.value.isLoading = true
        state.value.error = null

        try {
            const response = await $fetch<any>('/api/realtime')

            if (response.success) {
                data.value = {
                    timestamp: response.timestamp,
                    power: response.data.power,
                    powerKw: response.data.powerKw,
                    voltage: response.data.voltage,
                    current: response.data.current,
                    source: response.source,
                    totalKwh: response.data.totalKwh
                }
                state.value.source = response.source
                state.value.lastUpdate = response.timestamp
                state.value.isConnected = true
            } else {
                state.value.error = response.error
                state.value.isConnected = false
            }
        } catch (error: any) {
            state.value.error = error.message || 'Connection failed'
            state.value.isConnected = false
        } finally {
            state.value.isLoading = false
        }
    }

    const connect = (interval?: number) => {
        if (intervalId) return // Already connected

        if (interval) pollInterval.value = interval

        // Fetch immediately
        fetchData()

        // Then poll regularly
        intervalId = globalThis.setInterval(fetchData, pollInterval.value)
    }

    const disconnect = () => {
        if (intervalId) {
            globalThis.clearInterval(intervalId)
            intervalId = null
        }
        state.value.isConnected = false
        state.value.source = 'none'
    }

    const updatePollInterval = (interval: number) => {
        pollInterval.value = interval
        if (intervalId) {
            disconnect()
            connect(interval)
        }
    }

    // Get current data source configuration
    const getSourceConfig = async () => {
        try {
            const response = await $fetch<any>('/api/datasource')
            return response.data
        } catch {
            return null
        }
    }

    // Update data source configuration
    const setSourceConfig = async (config: {
        type: string
        enabled: boolean
        config: Record<string, any>
        testConnection?: boolean
    }) => {
        const response = await $fetch<any>('/api/datasource', {
            method: 'PUT',
            body: config
        })
        return response
    }

    // Auto-cleanup
    if (import.meta.client) {
        onBeforeUnmount(() => {
            disconnect()
        })
    }

    // Computed helpers
    const currentPower = computed(() => data.value?.powerKw ?? 0)
    const isSimulation = computed(() => state.value.source === 'simulation')
    const sourceLabel = computed(() => {
        const labels: Record<string, string> = {
            simulation: 'Simulation',
            shelly: 'Shelly EM',
            homeassistant: 'Home Assistant',
            enedis: 'Enedis',
            none: 'Déconnecté'
        }
        return labels[state.value.source] || state.value.source
    })

    return {
        data,
        state,
        currentPower,
        isSimulation,
        sourceLabel,
        pollInterval,
        connect,
        disconnect,
        fetchData,
        updatePollInterval,
        getSourceConfig,
        setSourceConfig
    }
}
