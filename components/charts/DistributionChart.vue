<script setup lang="ts">
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
    data: number[]
    labels: string[]
}>()

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20
            }
        }
    }
}))

const chartData = computed<ChartData<'doughnut'>>(() => ({
    labels: props.labels,
    datasets: [
        {
            backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'], // Green, Blue, Amber
            data: props.data,
            borderWidth: 0,
        }
    ]
}))
</script>

<template>
    <div class="h-full w-full">
        <Doughnut :data="chartData" :options="chartOptions" />
    </div>
</template>
