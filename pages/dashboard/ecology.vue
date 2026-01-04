<script setup lang="ts">
import { Leaf, Car, TreeDeciduous, Factory, TrendingDown, TrendingUp, Minus, Database } from 'lucide-vue-next'
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

const { getImpactSummary, getEcoTips, NATIONAL_AVERAGE_MONTHLY } = useImpactCalculator()

// Use Nuxt's useLazyAsyncData for proper client-side navigation support
const { data: stats, pending: isLoading } = useLazyAsyncData(
    'ecology-stats',
    () => $fetch<any>('/api/readings/stats?period=day&days=30')
)

const totalKwh = computed(() => stats.value?.summary?.totalKwh || 0)
const hasData = computed(() => stats.value?.summary?.readingsCount > 0)

const impact = computed(() => getImpactSummary(totalKwh.value))
const tips = computed(() => getEcoTips(impact.value.status))

const statusConfig = {
    better: { color: 'text-green-500', bg: 'bg-green-500/10', icon: TrendingDown, label: 'Excellent' },
    average: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Minus, label: 'Dans la moyenne' },
    worse: { color: 'text-red-500', bg: 'bg-red-500/10', icon: TrendingUp, label: 'À améliorer' }
}

const currentStatus = computed(() => statusConfig[impact.value.status])

const comparisonChartData = computed(() => ({
    labels: ['Votre consommation', 'Moyenne nationale'],
    datasets: [{
        data: [totalKwh.value, NATIONAL_AVERAGE_MONTHLY],
        backgroundColor: [
            impact.value.status === 'better' ? 'rgba(34, 197, 94, 0.7)' :
                impact.value.status === 'worse' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)',
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
                            {{ impact.comparisonPercent > 0 ? '+' : '' }}{{ impact.comparisonPercent }}% par rapport à
                            la moyenne nationale
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold">{{ impact.co2Kg.toFixed(1) }} kg</div>
                    <div class="text-sm text-muted-foreground">CO₂ ce mois</div>
                </div>
            </div>

            <!-- Impact Cards -->
            <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-xl border border-border bg-card p-6 text-center">
                    <Car class="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <div class="text-3xl font-bold">{{ impact.kmEquivalent.toFixed(0) }} km</div>
                    <p class="text-muted-foreground mt-2">Équivalent en voiture</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ impact.kmEquivalent > 600 ? 'Paris - Marseille' : impact.kmEquivalent > 300 ? 'Paris - Lyon'
                            : 'Paris - Orléans' }} environ
                    </p>
                </div>

                <div class="rounded-xl border border-border bg-card p-6 text-center">
                    <TreeDeciduous class="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <div class="text-3xl font-bold">{{ impact.treesNeeded.toFixed(1) }}</div>
                    <p class="text-muted-foreground mt-2">Arbres pour compenser</p>
                    <p class="text-xs text-muted-foreground mt-1">Absorption annuelle d'un arbre mature</p>
                </div>

                <div class="rounded-xl border border-border bg-card p-6 text-center">
                    <Factory class="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <div class="text-3xl font-bold">{{ impact.kwh.toFixed(0) }} kWh</div>
                    <p class="text-muted-foreground mt-2">Consommation mensuelle</p>
                    <p class="text-xs text-muted-foreground mt-1">Moyenne nationale: {{ NATIONAL_AVERAGE_MONTHLY }} kWh
                    </p>
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

            <!-- Conversion Info -->
            <div class="rounded-xl border border-border bg-card p-6">
                <h3 class="font-semibold mb-4">📊 Comment c'est calculé ?</h3>
                <div class="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <strong class="text-foreground">kWh → CO₂</strong>
                        <p class="mt-1">1 kWh = 56.9g CO₂ (mix énergétique français 2024)</p>
                    </div>
                    <div class="p-4 bg-secondary/50 rounded-lg">
                        <strong class="text-foreground">CO₂ → km voiture</strong>
                        <p class="mt-1">1 kg CO₂ ≈ 6.5 km parcourus (voiture essence)</p>
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
