<script setup lang="ts">
import { Leaf, Car, TreeDeciduous, Factory, TrendingDown, TrendingUp, Minus, Database, Route, UtensilsCrossed, Activity } from 'lucide-vue-next'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

definePageMeta({
    layout: 'default'
})

const { getImpactSummary, getEcoTips, NATIONAL_AVERAGE_MONTHLY, kwhToCO2, co2ToKm, co2ToTrees } = useImpactCalculator()
const { getActivityStats } = useActivities()

// Use Nuxt's useLazyAsyncData for proper client-side navigation support
const { data: stats, pending: isLoading } = useLazyAsyncData(
    'ecology-stats',
    () => $fetch<any>('/api/readings/stats?period=day&days=30')
)

// Récupérer les statistiques de toutes les activités (30 derniers jours)
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)
const startDate = thirtyDaysAgo.toISOString().slice(0, 10)
const endDate = today.toISOString().slice(0, 10)

const { data: activitiesStats, pending: isLoadingActivities } = useLazyAsyncData(
    'activities-stats',
    () => $fetch<any>(`/api/activities/stats?startDate=${startDate}&endDate=${endDate}`)
)

// Récupérer toutes les activités pour calculer les stats par catégorie
const { data: allActivities } = useLazyAsyncData(
    'all-activities',
    () => $fetch<any>(`/api/activities?startDate=${startDate}&endDate=${endDate}`)
)

const totalKwh = computed(() => stats.value?.summary?.totalKwh || 0)
const hasData = computed(() => stats.value?.summary?.readingsCount > 0)

// Calculer les stats depuis activities
const otherActivitiesCO2 = computed(() => {
    if (!allActivities.value?.data) return 0
    return allActivities.value.data
        .filter((a: any) => a.category !== 'trips' && a.category !== 'meals')
        .reduce((sum: number, a: any) => sum + a.co2_kg, 0)
})

const hasTrips = computed(() => {
    if (!allActivities.value?.data) return false
    return allActivities.value.data.some((a: any) => a.category === 'trips')
})

const hasMeals = computed(() => {
    if (!allActivities.value?.data) return false
    return allActivities.value.data.some((a: any) => a.category === 'meals')
})

const hasActivities = computed(() => {
    if (!allActivities.value?.data) return false
    return allActivities.value.data.some((a: any) => a.category !== 'trips' && a.category !== 'meals')
})

// Stats pour affichage
const tripsStats = computed(() => {
    if (!allActivities.value?.data) return null
    const trips = allActivities.value.data.filter((a: any) => a.category === 'trips')
    const totalTrips = trips.length
    const totalDistance = trips.reduce((sum: number, t: any) => sum + (t.quantity || 0), 0)
    const totalCO2 = trips.reduce((sum: number, t: any) => sum + t.co2_kg, 0)
    return {
        data: {
            totalTrips,
            totalDistance: Number(totalDistance.toFixed(2)),
            totalCO2: Number(totalCO2.toFixed(3))
        }
    }
})

const mealsStats = computed(() => {
    if (!allActivities.value?.data) return null
    const meals = allActivities.value.data.filter((a: any) => a.category === 'meals')
    const totalMeals = meals.length
    const totalCO2 = meals.reduce((sum: number, m: any) => sum + m.co2_kg, 0)
    const averageCO2PerMeal = totalMeals > 0 ? totalCO2 / totalMeals : 0
    return {
        data: {
            totalMeals,
            totalCO2: Number(totalCO2.toFixed(3)),
            averageCO2PerMeal: Number(averageCO2PerMeal.toFixed(3))
        }
    }
})

// Impact énergétique (électricité)
const energyImpact = computed(() => getImpactSummary(totalKwh.value))

// Impact total (électricité + trajets + repas + autres activités)
const totalCO2 = computed(() => energyImpact.value.co2Kg + otherActivitiesCO2.value)
const totalImpact = computed(() => ({
    co2Kg: totalCO2.value,
    kmEquivalent: co2ToKm(totalCO2.value),
    treesNeeded: co2ToTrees(totalCO2.value),
    energyCO2: energyImpact.value.co2Kg,
    activitiesCO2: otherActivitiesCO2.value
}))

const tips = computed(() => getEcoTips(energyImpact.value.status))

const statusConfig = {
    better: { color: 'text-green-500', bg: 'bg-green-500/10', icon: TrendingDown, label: 'Excellent' },
    average: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Minus, label: 'Dans la moyenne' },
    worse: { color: 'text-red-500', bg: 'bg-red-500/10', icon: TrendingUp, label: 'À améliorer' }
}

const currentStatus = computed(() => statusConfig[energyImpact.value.status])

const comparisonChartData = computed(() => ({
    labels: ['Votre consommation', 'Moyenne nationale'],
    datasets: [{
        data: [totalKwh.value, NATIONAL_AVERAGE_MONTHLY],
        backgroundColor: [
            energyImpact.value.status === 'better' ? 'rgba(34, 197, 94, 0.7)' :
                energyImpact.value.status === 'worse' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)',
            'rgba(100, 116, 139, 0.5)'
        ],
        borderRadius: 8
    }]
}))

const comparisonOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        x: {
            beginAtZero: true,
            title: { display: true, text: 'kWh/mois' }
        }
    }
}

// Graphique de répartition énergie vs trajets vs repas vs activités
const co2BreakdownChartData = computed(() => {
    const labels = ['Électricité']
    const data = [totalImpact.value.energyCO2]
    const colors = ['rgba(59, 130, 246, 0.7)']  // Bleu pour électricité
    
    if (hasActivities.value) {
        labels.push('Autres activités')
        data.push(totalImpact.value.activitiesCO2)
        colors.push('rgba(168, 85, 247, 0.7)')  // Violet pour autres activités
    }
    
    return {
        labels,
        datasets: [{
            data,
            backgroundColor: colors,
            borderRadius: 8
        }]
    }
})

const co2BreakdownChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true },
        tooltip: {
            callbacks: {
                label: (context: any) => `${context.label}: ${context.parsed.toFixed(2)} kg CO₂`
            }
        }
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <Leaf class="h-8 w-8 text-green-500" />
            <div>
                <h2 class="text-3xl font-bold tracking-tight">Impact Écologique</h2>
                <p class="text-muted-foreground">Visualisez votre empreinte carbone</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- No Data Banner -->
        <div v-else-if="!hasData" class="p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-center">
            <Database class="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 class="font-semibold">Aucune donnée disponible</h3>
            <p class="text-sm text-muted-foreground mt-2">
                Importez vos données pour calculer votre impact écologique depuis la page
                <NuxtLink to="/data" class="text-primary hover:underline">Données</NuxtLink>
            </p>
        </div>

        <template v-else>
            <!-- Status Banner -->
            <div :class="['rounded-xl border p-6 flex items-center justify-between', currentStatus.bg]">
                <div class="flex items-center gap-4">
                    <component :is="currentStatus.icon" :class="['h-10 w-10', currentStatus.color]" />
                    <div>
                        <h3 :class="['text-xl font-bold', currentStatus.color]">{{ currentStatus.label }}</h3>
                        <p class="text-muted-foreground">
                            {{ energyImpact.comparisonPercent > 0 ? '+' : '' }}{{ energyImpact.comparisonPercent }}% par rapport à
                            la moyenne nationale
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold">{{ totalImpact.co2Kg.toFixed(1) }} kg</div>
                    <div class="text-sm text-muted-foreground">CO₂ total (30j)</div>
                    <div v-if="hasTrips || hasMeals || hasActivities" class="text-xs text-muted-foreground mt-1">
                        Électricité: {{ totalImpact.energyCO2.toFixed(1) }} kg
                        <span v-if="hasActivities"> | Autres: {{ totalImpact.activitiesCO2.toFixed(1) }} kg</span>
                    </div>
                </div>
            </div>

            <!-- Impact Cards -->
            <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-xl border border-border bg-card p-6 text-center">
                    <Car class="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <div class="text-3xl font-bold">{{ totalImpact.kmEquivalent.toFixed(0) }} km</div>
                    <p class="text-muted-foreground mt-2">Équivalent en voiture</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ totalImpact.kmEquivalent > 600 ? 'Paris - Marseille' : totalImpact.kmEquivalent > 300 ? 'Paris - Lyon'
                            : 'Paris - Orléans' }} environ
                    </p>
                </div>

                <div class="rounded-xl border border-border bg-card p-6 text-center">
                    <TreeDeciduous class="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <div class="text-3xl font-bold">{{ totalImpact.treesNeeded.toFixed(1) }}</div>
                    <p class="text-muted-foreground mt-2">Arbres pour compenser</p>
                    <p class="text-xs text-muted-foreground mt-1">Absorption annuelle d'un arbre mature</p>
                </div>

                <div class="rounded-xl border border-border bg-card p-6 text-center">
                    <Factory class="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <div class="text-3xl font-bold">{{ energyImpact.kwh.toFixed(0) }} kWh</div>
                    <p class="text-muted-foreground mt-2">Consommation mensuelle</p>
                    <p class="text-xs text-muted-foreground mt-1">Moyenne nationale: {{ NATIONAL_AVERAGE_MONTHLY }} kWh
                    </p>
                </div>
            </div>

            <!-- Section Activités -->
            <div v-if="hasActivities" class="rounded-xl border border-border bg-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold flex items-center gap-2">
                        <Activity class="h-5 w-5 text-purple-500" />
                        Impact des autres activités (30 derniers jours)
                    </h3>
                    <NuxtLink to="/dashboard/activities" class="text-sm text-primary hover:underline">
                        Gérer mes activités →
                    </NuxtLink>
                </div>
                <div class="grid gap-4 md:grid-cols-3">
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <p class="text-sm text-muted-foreground">Total activités</p>
                        <p class="text-2xl font-bold">{{ allActivities?.data?.filter((a: any) => a.category !== 'trips' && a.category !== 'meals').length || 0 }}</p>
                    </div>
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <p class="text-sm text-muted-foreground">Moyenne/activité</p>
                        <p class="text-2xl font-bold">
                            {{ (() => {
                                const otherActs = allActivities?.data?.filter((a: any) => a.category !== 'trips' && a.category !== 'meals') || []
                                return otherActs.length > 0 ? (otherActivitiesCO2 / otherActs.length).toFixed(3) : '0'
                            })() }} kg
                        </p>
                    </div>
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <p class="text-sm text-muted-foreground">CO₂ émis</p>
                        <p class="text-2xl font-bold text-red-500">{{ totalImpact.activitiesCO2.toFixed(2) }} kg</p>
                    </div>
                </div>
            </div>

            <div v-else class="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6">
                <div class="flex items-center gap-4">
                    <Activity class="h-10 w-10 text-purple-500" />
                    <div class="flex-1">
                        <h3 class="font-semibold">Ajoutez vos autres activités pour un suivi complet</h3>
                        <p class="text-sm text-muted-foreground mt-1">
                            Enregistrez vos achats, déchets, loisirs, services et autres activités
                        </p>
                    </div>
                    <NuxtLink to="/dashboard/activities"
                        class="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                        Ajouter des activités
                    </NuxtLink>
                </div>
            </div>

            <!-- Comparison Chart & Tips -->
            <div class="grid gap-6 lg:grid-cols-2">
                <div class="rounded-xl border border-border bg-card p-6">
                    <h3 class="font-semibold mb-4">Comparaison avec la moyenne</h3>
                    <div class="h-[200px]">
                        <ClientOnly>
                            <Bar :data="comparisonChartData" :options="comparisonOptions" />
                        </ClientOnly>
                    </div>
                </div>

                <div class="rounded-xl border border-border bg-card p-6">
                    <h3 class="font-semibold mb-4">💡 Conseils personnalisés</h3>
                    <ul class="space-y-3">
                        <li v-for="(tip, index) in tips" :key="index" class="flex items-start gap-3">
                            <span
                                :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', currentStatus.bg, currentStatus.color]">
                                {{ index + 1 }}
                            </span>
                            <span class="text-muted-foreground">{{ tip }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Répartition CO2 -->
            <div v-if="hasTrips || hasMeals || hasActivities" class="rounded-xl border border-border bg-card p-6">
                <h3 class="font-semibold mb-4">Répartition des émissions CO₂</h3>
                <div class="h-[250px]">
                    <ClientOnly>
                        <Bar :data="co2BreakdownChartData" :options="co2BreakdownChartOptions" />
                    </ClientOnly>
                </div>
            </div>

            <!-- Conversion Info -->
            <div class="rounded-xl border border-border bg-card p-6">
                <h3 class="font-semibold mb-4">📊 Comment c'est calculé ?</h3>
                <div class="grid gap-4 md:grid-cols-4 text-sm text-muted-foreground">
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <strong class="text-foreground">kWh → CO₂</strong>
                        <p class="mt-1">1 kWh = 56.9g CO₂ (mix énergétique français 2024)</p>
                    </div>
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <strong class="text-foreground">Transports → CO₂</strong>
                        <p class="mt-1">Facteurs ADEME : Voiture essence 120g/km, TGV 2.7g/km, Bus 89g/km, etc.</p>
                    </div>
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <strong class="text-foreground">Repas → CO₂</strong>
                        <p class="mt-1">Fast food: 3-3.5 kg/repas, Restaurant: 2-4.5 kg/repas, Maison: 1-2.5 kg/repas</p>
                    </div>
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <strong class="text-foreground">Absorption arbre</strong>
                        <p class="mt-1">1 arbre adulte absorbe ~22 kg CO₂/an</p>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
