<script setup lang="ts">
import { Zap, TrendingDown, TrendingUp, Calendar, Database } from 'lucide-vue-next'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

definePageMeta({
    layout: 'default'
})

const selectedPeriod = ref<'hour' | 'day' | 'week' | 'month'>('day')
const selectedDays = ref(30)

const periods = [
    { value: 'hour', label: 'Horaire' },
    { value: 'day', label: 'Journalier' },
    { value: 'week', label: 'Hebdomadaire' },
    { value: 'month', label: 'Mensuel' }
] as const

// Use Nuxt's useLazyAsyncData for proper client-side navigation support
const { data: stats, pending: isLoading, refresh } = useLazyAsyncData(
    `energy-stats-${selectedPeriod.value}-${selectedDays.value}`,
    () => $fetch<any>(`/api/readings/stats?period=${selectedPeriod.value}&days=${selectedDays.value}`),
    {
        watch: [selectedPeriod, selectedDays]
    }
)

const totalKwh = computed(() => stats.value?.summary?.totalKwh || 0)
const averageDaily = computed(() => {
    const days = stats.value?.summary?.periodDays || 30
    return totalKwh.value / days
})
const peakPower = computed(() => stats.value?.summary?.peakKw || 0)
const trendPercent = computed(() => stats.value?.summary?.trendPercent || 0)
const hasData = computed(() => stats.value?.summary?.readingsCount > 0)

const chartData = computed(() => {
    if (!stats.value?.data?.length) return { labels: [], datasets: [] }

    const data = stats.value.data
    return {
        labels: data.map((d: any) => {
            if (selectedPeriod.value === 'day') {
                return new Date(d.period).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
            }
            if (selectedPeriod.value === 'hour') {
                return d.period.slice(11, 16)
            }
            return d.period
        }),
        datasets: [
            {
                label: 'Consommation (kWh)',
                data: data.map((d: any) => d.total),
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2
            }
        ]
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(128,128,128,0.1)' },
            title: { display: true, text: 'kWh' }
        },
        x: {
            grid: { display: false }
        }
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Zap class="h-8 w-8 text-yellow-500" />
                <div>
                    <h2 class="text-3xl font-bold tracking-tight">Détail Énergie</h2>
                    <p class="text-muted-foreground">Analyse de votre consommation électrique</p>
                </div>
            </div>

            <div class="flex gap-2">
                <select v-model="selectedDays" class="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option :value="7">7 jours</option>
                    <option :value="30">30 jours</option>
                    <option :value="90">90 jours</option>
                </select>

                <button v-for="period in periods" :key="period.value" @click="selectedPeriod = period.value" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedPeriod === period.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-accent text-secondary-foreground'
                ]">
                    {{ period.label }}
                </button>
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
                Importez vos données ou générez des données de démonstration depuis la page
                <NuxtLink to="/data" class="text-primary hover:underline">Données</NuxtLink>
            </p>
        </div>

        <template v-else>
            <!-- KPIs -->
            <div class="grid gap-4 md:grid-cols-4">
                <div class="rounded-xl border border-border bg-card p-6">
                    <div class="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar class="h-4 w-4" />
                        Total ({{ selectedDays }}j)
                    </div>
                    <div class="text-2xl font-bold mt-2">{{ totalKwh.toFixed(1) }} kWh</div>
                    <div
                        :class="['text-xs mt-1', trendPercent < 0 ? 'text-green-500' : trendPercent > 0 ? 'text-red-500' : '']">
                        {{ trendPercent > 0 ? '+' : '' }}{{ trendPercent.toFixed(1) }}% vs période précédente
                    </div>
                </div>

                <div class="rounded-xl border border-border bg-card p-6">
                    <div class="flex items-center gap-2 text-muted-foreground text-sm">
                        <TrendingUp class="h-4 w-4" />
                        Moyenne/jour
                    </div>
                    <div class="text-2xl font-bold mt-2">{{ averageDaily.toFixed(1) }} kWh</div>
                </div>

                <div class="rounded-xl border border-border bg-card p-6">
                    <div class="flex items-center gap-2 text-muted-foreground text-sm">
                        <Zap class="h-4 w-4 text-orange-500" />
                        Pic max
                    </div>
                    <div class="text-2xl font-bold mt-2">{{ peakPower.toFixed(2) }} kWh</div>
                </div>

                <div class="rounded-xl border border-border bg-card p-6">
                    <div class="flex items-center gap-2 text-muted-foreground text-sm">
                        💰 Coût estimé
                    </div>
                    <div class="text-2xl font-bold mt-2">{{ (totalKwh * 0.2516).toFixed(2) }} €</div>
                    <div class="text-xs text-muted-foreground mt-1">Tarif EDF base</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="rounded-xl border border-border bg-card p-6">
                <h3 class="font-semibold mb-4">Historique de consommation</h3>
                <div class="h-[350px]">
                    <ClientOnly>
                        <Bar v-if="chartData.labels?.length" :data="chartData" :options="chartOptions" />
                        <div v-else class="h-full flex items-center justify-center text-muted-foreground">
                            Chargement...
                        </div>
                    </ClientOnly>
                </div>
            </div>
        </template>
    </div>
</template>
