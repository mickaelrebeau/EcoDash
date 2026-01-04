<script setup lang="ts">
import { Zap, Activity, Leaf, TrendingUp, AlertTriangle, Database, Wifi } from 'lucide-vue-next'
import KpiCard from '~/components/kpi/KpiCard.vue'
import SimpleSparkline from '~/components/charts/SimpleSparkline.vue'
import DistributionChart from '~/components/charts/DistributionChart.vue'

definePageMeta({
    layout: 'default'
})

const { connect, data: realtimeData, state: realtimeState, sourceLabel } = useRealtime()
const { checkThreshold, alerts, addInsight } = useAlerts()
const { getImpactSummary } = useImpactCalculator()

// Use Nuxt's useLazyAsyncData for proper client-side navigation support
const { data: stats } = useLazyAsyncData(
    'dashboard-stats',
    () => $fetch<any>('/api/readings/stats?period=day&days=30')
)

const totalKwh = computed(() => stats.value?.summary?.totalKwh || 0)
const peakPower = computed(() => stats.value?.summary?.peakKw || 0)
const trendPercent = computed(() => stats.value?.summary?.trendPercent || 0)
const hasData = computed(() => stats.value?.summary?.readingsCount > 0)

// State for chart history
// Increased limit for smoother sparkline
const historyLimit = 60
const chartValues = ref<number[]>([])

// Computed KPIs - use new data structure
const currentPower = computed(() => realtimeData.value?.powerKw ?? 0)
const loadPercentage = computed(() => Math.round((currentPower.value / 9) * 100))
const impact = computed(() => getImpactSummary(totalKwh.value))

// Daily peak tracking
const todayPeak = ref({ value: 0, time: '' })

// Watch for new data to update history and check alerts
const isMounted = ref(false)

onMounted(() => {
    isMounted.value = true
})

onBeforeUnmount(() => {
    isMounted.value = false
})

watch(realtimeData, (newData) => {
    if (newData && isMounted.value) {
        const power = newData.powerKw
        const time = new Date(newData.timestamp).toLocaleTimeString()

        // Add to chart
        chartValues.value.push(power)

        // Keep window fixed
        if (chartValues.value.length > historyLimit) {
            chartValues.value.shift()
        }

        // Track daily peak
        if (power > todayPeak.value.value) {
            todayPeak.value = { value: power, time }
        }

        // Check alerts
        checkThreshold(power, 'kW')
    }
})

// Recent alerts (last 3)
const recentAlerts = computed(() =>
    alerts.value.filter(a => !a.acknowledged).slice(0, 3)
)

// Estimated cost
const estimatedCost = computed(() => (totalKwh.value * 0.2516).toFixed(2))

// Connect realtime on client side
if (import.meta.client) {
    connect()

    // Add a welcome insight after delay if no data
    setTimeout(() => {
        if (!hasData.value && alerts.value.length === 0) {
            addInsight('Bienvenue ! Importez vos données depuis la page "Données" pour commencer.')
        }
    }, 3000)
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-3xl font-bold tracking-tight">Vue d'ensemble</h2>
                <p class="text-muted-foreground mt-1">Suivi de votre consommation énergétique en temps réel.</p>
            </div>
            <div class="flex items-center gap-2">
                <NuxtLink to="/connection" :class="[
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors hover:opacity-80',
                    realtimeState.isConnected ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                ]">
                    <span
                        :class="['w-2 h-2 rounded-full', realtimeState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500']"></span>
                    <Wifi class="h-4 w-4" />
                    <span>{{ sourceLabel }}</span>
                </NuxtLink>
            </div>
        </div>

        <!-- No Data Banner -->
        <div v-if="!hasData" class="p-6 rounded-xl border border-blue-500/30 bg-blue-500/10">
            <div class="flex items-center gap-4">
                <Database class="h-10 w-10 text-blue-500" />
                <div class="flex-1">
                    <h3 class="font-semibold">Commencez par importer vos données</h3>
                    <p class="text-sm text-muted-foreground mt-1">
                        Importez vos données Linky/Enedis ou générez des données de démonstration pour explorer le
                        tableau de bord.
                    </p>
                </div>
                <NuxtLink to="/data"
                    class="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                    Gérer les données
                </NuxtLink>
            </div>
        </div>

        <!-- Alerts Banner -->
        <div v-if="recentAlerts.length > 0" class="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
            <div class="flex items-center gap-3">
                <AlertTriangle class="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div class="flex-1">
                    <p class="text-sm font-medium">{{ recentAlerts[0].message }}</p>
                </div>
                <NuxtLink to="/dashboard/alerts" class="text-xs text-yellow-600 hover:underline">
                    Voir tout ({{alerts.filter(a => !a.acknowledged).length}})
                </NuxtLink>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Consommation Actuelle" :value="currentPower.toFixed(2) + ' kW'" :trend="loadPercentage"
                trendLabel="% de charge max" :icon="Zap" />
            <KpiCard title="Impact Carbone (30j)" :value="impact.co2Kg.toFixed(1) + ' kg'"
                :trend="impact.comparisonPercent" trendLabel="vs moyenne nationale" :icon="Leaf" />
            <KpiCard title="Pic de Puissance" :value="(todayPeak.value || peakPower).toFixed(2) + ' kW'"
                :trendLabel="todayPeak.time ? 'à ' + todayPeak.time : 'max 30j'" :icon="Activity" />
            <KpiCard title="Coût Estimé (30j)" :value="estimatedCost + ' €'" :trend="trendPercent"
                trendLabel="vs mois précédent" :icon="TrendingUp" />
        </div>

        <!-- Charts -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div class="col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                <div class="flex flex-col space-y-1.5 p-6 pb-4">
                    <h3 class="font-semibold leading-none tracking-tight">Consommation Temps Réel</h3>
                    <p class="text-sm text-muted-foreground">Évolution sur les dernières minutes</p>
                </div>
                <div class="p-6 pt-0">
                    <div class="h-[300px] w-full">
                        <ClientOnly>
                            <SimpleSparkline :data="chartValues" />
                            <template #fallback>
                                <div class="h-full w-full flex items-center justify-center bg-secondary/10 rounded-lg">
                                    <span class="text-muted-foreground">Chargement du graphique...</span>
                                </div>
                            </template>
                        </ClientOnly>
                    </div>
                </div>
            </div>

            <div class="col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                <div class="flex flex-col space-y-1.5 p-6 pb-4">
                    <h3 class="font-semibold leading-none tracking-tight">Répartition estimée</h3>
                    <p class="text-sm text-muted-foreground">Par type d'usage (estimation)</p>
                </div>
                <div class="p-6 pt-0">
                    <div class="h-[300px] w-full">
                        <ClientOnly>
                            <DistributionChart :data="[45, 30, 25]" :labels="['Chauffage', 'Appareils', 'Éclairage']" />
                            <template #fallback>
                                <div class="h-full w-full flex items-center justify-center bg-secondary/10 rounded-lg">
                                    <span class="text-muted-foreground">Chargement...</span>
                                </div>
                            </template>
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Links -->
        <div class="grid gap-4 md:grid-cols-3">
            <NuxtLink to="/dashboard/energy"
                class="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors group">
                <Zap class="h-8 w-8 text-yellow-500 mb-2" />
                <h4 class="font-semibold group-hover:text-primary transition-colors">Détail Énergie</h4>
                <p class="text-sm text-muted-foreground">Historique et analyse détaillée</p>
            </NuxtLink>

            <NuxtLink to="/dashboard/ecology"
                class="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors group">
                <Leaf class="h-8 w-8 text-green-500 mb-2" />
                <h4 class="font-semibold group-hover:text-primary transition-colors">Impact Écologique</h4>
                <p class="text-sm text-muted-foreground">CO₂, équivalents et conseils</p>
            </NuxtLink>

            <NuxtLink to="/data"
                class="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors group">
                <Database class="h-8 w-8 text-blue-500 mb-2" />
                <h4 class="font-semibold group-hover:text-primary transition-colors">Gestion des Données</h4>
                <p class="text-sm text-muted-foreground">Import CSV, saisie manuelle</p>
            </NuxtLink>
        </div>
    </div>
</template>
