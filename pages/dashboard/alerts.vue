<script setup lang="ts">
import { AlertTriangle, Info, AlertCircle, Check, X, Bell, Trash2 } from 'lucide-vue-next'

definePageMeta({
    layout: 'default'
})

const { alerts, rules, unacknowledgedCount, acknowledgeAlert, acknowledgeAll, clearAlerts } = useAlerts()

const severityConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
}

const typeLabels = {
    threshold: 'Seuil',
    anomaly: 'Anomalie',
    insight: 'Info'
}

const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Bell class="h-8 w-8 text-orange-500" />
                <div>
                    <h2 class="text-3xl font-bold tracking-tight">Alertes & Insights</h2>
                    <p class="text-muted-foreground">Surveillance intelligente de votre consommation</p>
                </div>
            </div>

            <div class="flex gap-2">
                <button v-if="unacknowledgedCount > 0" @click="acknowledgeAll"
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-colors flex items-center gap-2">
                    <Check class="h-4 w-4" />
                    Tout marquer comme lu
                </button>
                <button v-if="alerts.length > 0" @click="clearAlerts"
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-2">
                    <Trash2 class="h-4 w-4" />
                    Effacer tout
                </button>
            </div>
        </div>

        <!-- Rules Management -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4">⚙️ Règles d'alerte</h3>
            <div class="grid gap-4 md:grid-cols-2">
                <div v-for="rule in rules" :key="rule.id"
                    class="p-4 bg-secondary/50 rounded-lg flex items-center justify-between">
                    <div>
                        <div class="font-medium">{{ rule.name }}</div>
                        <div class="text-sm text-muted-foreground">
                            Alerte si {{ rule.type === 'above' ? '>' : '<' }} {{ rule.threshold }} {{ rule.unit }}
                                </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" v-model="rule.enabled" class="sr-only peer">
                            <div
                                class="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Alerts List -->
            <div class="rounded-xl border border-border bg-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold">📋 Historique des alertes</h3>
                    <span v-if="unacknowledgedCount > 0"
                        class="px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                        {{ unacknowledgedCount }} non lue(s)
                    </span>
                </div>

                <div v-if="alerts.length === 0" class="text-center py-12 text-muted-foreground">
                    <Bell class="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Aucune alerte pour le moment</p>
                    <p class="text-sm">Les alertes apparaîtront ici lorsque des seuils seront dépassés</p>
                </div>

                <div v-else class="space-y-3">
                    <div v-for="alert in alerts" :key="alert.id" :class="[
                        'p-4 rounded-lg border flex items-start gap-4 transition-all',
                        severityConfig[alert.severity].bg,
                        severityConfig[alert.severity].border,
                        alert.acknowledged ? 'opacity-60' : ''
                    ]">
                        <component :is="severityConfig[alert.severity].icon"
                            :class="['h-5 w-5 mt-0.5 flex-shrink-0', severityConfig[alert.severity].color]" />
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs px-2 py-0.5 rounded-full bg-background/50 font-medium">
                                    {{ typeLabels[alert.type] }}
                                </span>
                                <span class="text-xs text-muted-foreground">{{ formatTime(alert.timestamp) }}</span>
                            </div>
                            <p class="text-sm">{{ alert.message }}</p>
                        </div>
                        <button v-if="!alert.acknowledged" @click="acknowledgeAlert(alert.id)"
                            class="p-1 rounded hover:bg-background/50 transition-colors" title="Marquer comme lu">
                            <X class="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
</template>
