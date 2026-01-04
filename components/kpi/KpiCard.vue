<script setup lang="ts">
import { cn } from '~/utils/cn'

defineProps<{
    title: string
    value: string | number
    trend?: number
    trendLabel?: string
    icon?: any
}>()
</script>

<template>
    <div
        class="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 class="tracking-tight text-sm font-medium text-muted-foreground">{{ title }}</h3>
            <component :is="icon" v-if="icon" class="h-4 w-4 text-muted-foreground" />
        </div>
        <div class="pt-2">
            <div class="text-2xl font-bold">{{ value }}</div>
            <p v-if="trend || trendLabel" class="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                <span :class="trend && trend > 0 ? 'text-red-500' : 'text-green-500'" v-if="trend !== undefined">
                    {{ trend > 0 ? '+' : '' }}{{ trend }}%
                </span>
                <span class="opacity-70">{{ trendLabel }}</span>
            </p>
        </div>
    </div>
</template>
