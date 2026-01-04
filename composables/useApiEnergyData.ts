// Composable for fetching energy data from the API
export const useApiEnergyData = () => {
    const readings = ref<any[]>([])
    const stats = ref<any>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const fetchReadings = async (params: { limit?: number; from?: string; to?: string } = {}) => {
        isLoading.value = true
        error.value = null
        try {
            const query = new URLSearchParams()
            if (params.limit) query.append('limit', String(params.limit))
            if (params.from) query.append('from', params.from)
            if (params.to) query.append('to', params.to)

            const response = await $fetch<any>(`/api/readings?${query.toString()}`)
            readings.value = response.data
            return response
        } catch (e: any) {
            error.value = e.message
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const fetchStats = async (params: { period?: string; days?: number } = {}) => {
        isLoading.value = true
        error.value = null
        try {
            const query = new URLSearchParams()
            query.append('period', params.period || 'day')
            query.append('days', String(params.days || 30))

            const response = await $fetch<any>(`/api/readings/stats?${query.toString()}`)
            stats.value = response
            return response
        } catch (e: any) {
            error.value = e.message
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const addReading = async (reading: { timestamp?: string; value: number; type?: string }) => {
        const response = await $fetch('/api/readings', {
            method: 'POST',
            body: reading
        })
        return response
    }

    // Computed values from stats
    const totalKwh = computed(() => stats.value?.summary?.totalKwh || 0)
    const averageDaily = computed(() => {
        const days = stats.value?.summary?.periodDays || 30
        return totalKwh.value / days
    })
    const peakPower = computed(() => stats.value?.summary?.peakKw || 0)
    const trendPercent = computed(() => stats.value?.summary?.trendPercent || 0)
    const hasData = computed(() => stats.value?.summary?.readingsCount > 0)

    return {
        readings,
        stats,
        isLoading,
        error,
        fetchReadings,
        fetchStats,
        addReading,
        totalKwh,
        averageDaily,
        peakPower,
        trendPercent,
        hasData
    }
}
