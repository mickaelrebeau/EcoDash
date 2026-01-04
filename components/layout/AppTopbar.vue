<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
</script>

<template>
    <header
        class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
        <div class="flex-1">
            <h1 class="font-semibold text-lg">Tableau de bord</h1>
        </div>

        <div class="flex items-center gap-4">
            <button class="relative rounded-full p-2 hover:bg-accent transition-colors">
                <Bell class="h-5 w-5 text-muted-foreground" />
                <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"></span>
            </button>

            <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                <span class="font-medium text-sm text-primary">JD</span>
            </div>
        </div>
    </header>
</template>
