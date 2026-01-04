export interface Alert {
    id: string
    type: 'threshold' | 'anomaly' | 'insight'
    severity: 'info' | 'warning' | 'critical'
    message: string
    timestamp: Date
    acknowledged: boolean
    context?: {
        currentValue?: number
        threshold?: number
        unit?: string
    }
}

export interface AlertRule {
    id: string
    name: string
    enabled: boolean
    threshold: number
    unit: string
    type: 'above' | 'below'
}

export const useAlerts = () => {
    const alerts = ref<Alert[]>([])
    const rules = ref<AlertRule[]>([
        {
            id: 'peak-power',
            name: 'Pic de puissance',
            enabled: true,
            threshold: 5,
            unit: 'kW',
            type: 'above'
        },
        {
            id: 'daily-consumption',
            name: 'Consommation journalière',
            enabled: true,
            threshold: 15,
            unit: 'kWh',
            type: 'above'
        }
    ])

    const unacknowledgedCount = computed(() =>
        alerts.value.filter(a => !a.acknowledged).length
    )

    const generateId = () => Math.random().toString(36).substring(2, 9)

    const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) => {
        const newAlert: Alert = {
            ...alert,
            id: generateId(),
            timestamp: new Date(),
            acknowledged: false
        }
        alerts.value.unshift(newAlert)

        // Keep only last 50 alerts
        if (alerts.value.length > 50) {
            alerts.value = alerts.value.slice(0, 50)
        }
    }

    const checkThreshold = (value: number, unit: string) => {
        for (const rule of rules.value) {
            if (!rule.enabled || rule.unit !== unit) continue

            const exceeded = rule.type === 'above'
                ? value > rule.threshold
                : value < rule.threshold

            if (exceeded) {
                // Check if similar alert exists in last 5 minutes
                const recentSimilar = alerts.value.find(a =>
                    a.context?.threshold === rule.threshold &&
                    (new Date().getTime() - a.timestamp.getTime()) < 5 * 60 * 1000
                )

                if (!recentSimilar) {
                    addAlert({
                        type: 'threshold',
                        severity: value > rule.threshold * 1.5 ? 'critical' : 'warning',
                        message: `${rule.name}: ${value.toFixed(2)} ${unit} (seuil: ${rule.threshold} ${unit})`,
                        context: {
                            currentValue: value,
                            threshold: rule.threshold,
                            unit
                        }
                    })
                }
            }
        }
    }

    const detectAnomaly = (values: number[]) => {
        if (values.length < 10) return

        const recent = values.slice(-5)
        const historical = values.slice(-20, -5)

        if (historical.length === 0) return

        const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
        const avgHistorical = historical.reduce((a, b) => a + b, 0) / historical.length

        const deviation = ((avgRecent - avgHistorical) / avgHistorical) * 100

        if (Math.abs(deviation) > 30) {
            addAlert({
                type: 'anomaly',
                severity: 'info',
                message: deviation > 0
                    ? `Pic inhabituel détecté: +${deviation.toFixed(0)}% vs moyenne`
                    : `Consommation anormalement basse: ${deviation.toFixed(0)}% vs moyenne`
            })
        }
    }

    const addInsight = (message: string) => {
        addAlert({
            type: 'insight',
            severity: 'info',
            message
        })
    }

    const acknowledgeAlert = (id: string) => {
        const alert = alerts.value.find(a => a.id === id)
        if (alert) {
            alert.acknowledged = true
        }
    }

    const acknowledgeAll = () => {
        alerts.value.forEach(a => a.acknowledged = true)
    }

    const clearAlerts = () => {
        alerts.value = []
    }

    return {
        alerts,
        rules,
        unacknowledgedCount,
        addAlert,
        checkThreshold,
        detectAnomaly,
        addInsight,
        acknowledgeAlert,
        acknowledgeAll,
        clearAlerts
    }
}
