<script setup lang="ts">
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartData,
    type ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useTheme } from '#imports' // Assuming we might have a theme composable later, but for now we check dark mode manually or via props

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const props = defineProps<{
    data: number[] // Array of recent values
    labels: string[] // Array of timestamps/labels
    color?: string
}>()

// Chart Configuration
const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 0 // Disable animation for generic updates to avoid "wobbly" effect on realtime, or keep it short
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 4,
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(128, 128, 128, 0.1)',
            },
            ticks: {
                color: '#888'
            },
            title: {
                display: true,
                text: 'kW',
                color: '#888'
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                display: false // Hide time labels for clean look on small sparklines, or show sparse
            }
        }
    }
}))

const chartData = computed<ChartData<'line'>>(() => ({
    labels: props.labels,
    datasets: [
        {
            label: 'Consommation (kW)',
            backgroundColor: (context: any) => {
                const ctx = context.chart?.ctx;
                if (!ctx) return 'rgba(34, 197, 94, 0.4)'; // Fallback color
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); // Primary Green
                gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
                return gradient;
            },
            borderColor: '#22c55e', // Primary Green
            borderWidth: 2,
            pointRadius: 0, // Clean line without points
            pointHoverRadius: 4,
            data: props.data,
            fill: true,
            tension: 0.4 // Smooth curve
        }
    ]
}))
</script>

<template>
    <div class="h-full w-full">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>
