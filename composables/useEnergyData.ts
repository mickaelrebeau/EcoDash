export interface EnergyReading {
    id: string
    timestamp: Date
    type: 'electricity' | 'gas' | 'water'
    value: number
    unit: string
}

export interface AggregatedData {
    period: string
    value: number
    average: number
}

export const useEnergyData = () => {
    const readings = ref<EnergyReading[]>([])
    const isLoading = ref(false)
    const selectedPeriod = ref<'hour' | 'day' | 'week' | 'month'>('day')

    // Generate mock historical data
    const generateMockData = (days: number = 30): EnergyReading[] => {
        const data: EnergyReading[] = []
        const now = new Date()

        for (let d = days; d >= 0; d--) {
            for (let h = 0; h < 24; h++) {
                const date = new Date(now)
                date.setDate(date.getDate() - d)
                date.setHours(h, 0, 0, 0)

                // Simulate realistic consumption pattern
                let baseConsumption = 0.8 // Base load

                // Peak morning (7-9h)
                if (h >= 7 && h <= 9) baseConsumption = 2.5
                // Peak evening (18-22h)
                else if (h >= 18 && h <= 22) baseConsumption = 3.5
                // Night (23h-6h)
                else if (h >= 23 || h <= 6) baseConsumption = 0.5
                // Day (10-17h)
                else baseConsumption = 1.2

                // Add some randomness
                const variation = (Math.random() - 0.5) * 0.5
                const value = Math.max(0.1, baseConsumption + variation)

                data.push({
                    id: `reading-${d}-${h}`,
                    timestamp: date,
                    type: 'electricity',
                    value: Number(value.toFixed(2)),
                    unit: 'kWh'
                })
            }
        }

        return data
    }

    const loadData = async () => {
        isLoading.value = true
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        readings.value = generateMockData(30)
        isLoading.value = false
    }

    const aggregateByPeriod = (period: 'hour' | 'day' | 'week' | 'month'): AggregatedData[] => {
        const grouped: Record<string, number[]> = {}

        readings.value.forEach(reading => {
            let key: string
            const date = new Date(reading.timestamp)

            switch (period) {
                case 'hour':
                    key = date.toISOString().slice(0, 13) // YYYY-MM-DDTHH
                    break
                case 'day':
                    key = date.toISOString().slice(0, 10) // YYYY-MM-DD
                    break
                case 'week':
                    const weekNum = Math.ceil(date.getDate() / 7)
                    key = `${date.getFullYear()}-W${weekNum}`
                    break
                case 'month':
                    key = date.toISOString().slice(0, 7) // YYYY-MM
                    break
            }

            if (!grouped[key]) grouped[key] = []
            grouped[key].push(reading.value)
        })

        return Object.entries(grouped).map(([period, values]) => ({
            period,
            value: Number(values.reduce((a, b) => a + b, 0).toFixed(2)),
            average: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
        }))
    }

    const getTodayTotal = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return readings.value
            .filter(r => r.timestamp.toISOString().slice(0, 10) === today)
            .reduce((sum, r) => sum + r.value, 0)
    })

    const getWeekTotal = computed(() => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return readings.value
            .filter(r => r.timestamp >= weekAgo)
            .reduce((sum, r) => sum + r.value, 0)
    })

    const getMonthTotal = computed(() => {
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 30)
        return readings.value
            .filter(r => r.timestamp >= monthAgo)
            .reduce((sum, r) => sum + r.value, 0)
    })

    const getPeakHour = computed(() => {
        const hourlyData = aggregateByPeriod('hour')
        if (hourlyData.length === 0) return { hour: 0, value: 0 }

        const peak = hourlyData.reduce((max, curr) =>
            curr.average > max.average ? curr : max
        )

        return {
            hour: parseInt(peak.period.slice(-2)),
            value: peak.average
        }
    })

    return {
        readings,
        isLoading,
        selectedPeriod,
        loadData,
        aggregateByPeriod,
        getTodayTotal,
        getWeekTotal,
        getMonthTotal,
        getPeakHour
    }
}
