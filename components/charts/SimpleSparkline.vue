<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    data: number[]
    height?: number
    strokeColor?: string
    fillColor?: string
    gradientStart?: string
    gradientEnd?: string
}>()

const height = props.height || 300
// We use a fixed viewBox width to simplify calculations, SVG will scale it
const width = 1000

const min = computed(() => Math.min(...props.data, 0))
const max = computed(() => Math.max(...props.data, Math.max(...props.data) * 1.1, 0.1)) // Ensure min height if 0

const points = computed(() => {
    if (!props.data.length) return ''

    // Normalize data to fit in viewBox
    const range = max.value - min.value
    const stepX = width / (props.data.length - 1 || 1)

    return props.data.map((val, index) => {
        const x = index * stepX
        // Invert Y because SVG origin is top-left
        const normalizedY = (val - min.value) / range
        const y = height - (normalizedY * height)
        return `${x},${y}`
    }).join(' ')
})

// Create a smooth path using simplistic smoothing or straight lines
// For valid realtime data, straight lines are often clearer, but let's do simple smoothing
const pathD = computed(() => {
    if (props.data.length < 2) return ''

    const pts = points.value.split(' ').map(p => p.split(',').map(Number))

    // Start
    let d = `M ${pts[0][0]},${pts[0][1]}`

    // Simple line connection
    for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i][0]},${pts[i][1]}`
    }

    return d
})

const fillPathD = computed(() => {
    if (!pathD.value) return ''
    return `${pathD.value} L ${width},${height} L 0,${height} Z`
})

const stroke = computed(() => props.strokeColor || '#22c55e') // green-500
</script>

<template>
    <div class="h-full w-full relative overflow-hidden" ref="container">
        <svg class="w-full h-full" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" :stop-color="stroke" stop-opacity="0.4" />
                    <stop offset="100%" :stop-color="stroke" stop-opacity="0.0" />
                </linearGradient>
            </defs>

            <!-- Area Fill -->
            <path :d="fillPathD" fill="url(#chartGradient)" />

            <!-- Line Stroke -->
            <path :d="pathD" fill="none" :stroke="stroke" stroke-width="3" vector-effect="non-scaling-stroke"
                stroke-linejoin="round" stroke-linecap="round" />
        </svg>
    </div>
</template>
