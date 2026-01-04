export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    // Simulate database query
    const days = parseInt(query.days as string) || 30
    const type = query.type as string || 'electricity'

    const readings = []
    const now = new Date()

    for (let d = days; d >= 0; d--) {
        for (let h = 0; h < 24; h++) {
            const date = new Date(now)
            date.setDate(date.getDate() - d)
            date.setHours(h, 0, 0, 0)

            // Simulate realistic consumption
            let baseConsumption = 0.8
            if (h >= 7 && h <= 9) baseConsumption = 2.5
            else if (h >= 18 && h <= 22) baseConsumption = 3.5
            else if (h >= 23 || h <= 6) baseConsumption = 0.5
            else baseConsumption = 1.2

            const variation = (Math.random() - 0.5) * 0.5
            const value = Math.max(0.1, baseConsumption + variation)

            readings.push({
                id: `reading-${d}-${h}`,
                timestamp: date.toISOString(),
                type,
                value: Number(value.toFixed(2)),
                unit: 'kWh'
            })
        }
    }

    return {
        success: true,
        data: readings,
        meta: {
            total: readings.length,
            type,
            from: readings[0]?.timestamp,
            to: readings[readings.length - 1]?.timestamp
        }
    }
})
