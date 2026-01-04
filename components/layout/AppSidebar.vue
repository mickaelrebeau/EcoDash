<script setup lang="ts">
import { Home, Zap, Leaf, Settings, Bell, Database, Wifi } from 'lucide-vue-next'

const { unacknowledgedCount } = useAlerts()
</script>

<template>
    <aside
        class="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background/80 backdrop-blur-xl transition-transform">
        <div class="flex h-16 items-center border-b border-border px-6">
            <NuxtLink to="/dashboard" class="flex items-center gap-2 font-bold text-xl text-primary">
                <Leaf class="h-6 w-6" />
                <span>EcoDash</span>
            </NuxtLink>
        </div>

        <nav class="space-y-1 p-4">
            <NuxtLink to="/dashboard"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                active-class="bg-accent text-accent-foreground">
                <Home class="h-4 w-4" />
                Vue d'ensemble
            </NuxtLink>

            <NuxtLink to="/dashboard/energy"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                active-class="bg-accent text-accent-foreground">
                <Zap class="h-4 w-4" />
                Énergie
            </NuxtLink>

            <NuxtLink to="/dashboard/ecology"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                active-class="bg-accent text-accent-foreground">
                <Leaf class="h-4 w-4" />
                Écologie
            </NuxtLink>

            <NuxtLink to="/dashboard/alerts"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors relative"
                active-class="bg-accent text-accent-foreground">
                <Bell class="h-4 w-4" />
                Alertes
                <span v-if="unacknowledgedCount > 0"
                    class="absolute right-3 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                    {{ unacknowledgedCount }}
                </span>
            </NuxtLink>

            <div class="my-4 border-t border-border/50"></div>

            <NuxtLink to="/data"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                active-class="bg-accent text-accent-foreground">
                <Database class="h-4 w-4" />
                Données
            </NuxtLink>

            <NuxtLink to="/connection"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                active-class="bg-accent text-accent-foreground">
                <Wifi class="h-4 w-4" />
                Connexion
            </NuxtLink>

            <NuxtLink to="/settings"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                active-class="bg-accent text-accent-foreground">
                <Settings class="h-4 w-4" />
                Paramètres
            </NuxtLink>
        </nav>

        <div class="absolute bottom-4 left-4 right-4">
            <div class="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p class="text-xs text-primary font-medium">🌱 Conseil du jour</p>
                <p class="text-xs text-muted-foreground mt-1">Éteignez les appareils en veille pour économiser jusqu'à
                    10% d'énergie</p>
            </div>
        </div>
    </aside>
</template>
