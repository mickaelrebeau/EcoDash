<script setup lang="ts">
import { Settings, Sun, Moon, Bell, Zap, Save } from 'lucide-vue-next'

definePageMeta({
    layout: 'default'
})

const isDark = ref(false)
const settings = ref({
    notifications: {
        email: false,
        push: true,
        thresholdAlerts: true,
        weeklyReport: true
    },
    thresholds: {
        dailyLimit: 15,
        peakPower: 5
    },
    display: {
        currency: 'EUR',
        pricePerKwh: 0.2516
    }
})

const toggleTheme = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

const saveSettings = () => {
    // In a real app, this would save to backend/localStorage
    alert('Paramètres sauvegardés !')
}

onMounted(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDark.value = true
        document.documentElement.classList.add('dark')
    }
})
</script>

<template>
    <div class="space-y-6 max-w-3xl">
        <div class="flex items-center gap-3">
            <Settings class="h-8 w-8 text-gray-500" />
            <div>
                <h2 class="text-3xl font-bold tracking-tight">Paramètres</h2>
                <p class="text-muted-foreground">Configurez votre tableau de bord</p>
            </div>
        </div>

        <!-- Theme -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Sun class="h-5 w-5" />
                Apparence
            </h3>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">Thème sombre</p>
                    <p class="text-sm text-muted-foreground">Basculer entre le mode clair et sombre</p>
                </div>
                <button @click="toggleTheme" :class="[
                    'relative w-14 h-8 rounded-full transition-colors',
                    isDark ? 'bg-primary' : 'bg-gray-300'
                ]">
                    <span :class="[
                        'absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform flex items-center justify-center',
                        isDark ? 'translate-x-7' : 'translate-x-1'
                    ]">
                        <Moon v-if="isDark" class="h-3 w-3 text-primary" />
                        <Sun v-else class="h-3 w-3 text-yellow-500" />
                    </span>
                </button>
            </div>
        </div>

        <!-- Notifications -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Bell class="h-5 w-5" />
                Notifications
            </h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-medium">Alertes de seuil</p>
                        <p class="text-sm text-muted-foreground">Recevoir une alerte en cas de dépassement</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.notifications.thresholdAlerts" class="sr-only peer">
                        <div
                            class="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
                        </div>
                    </label>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-medium">Rapport hebdomadaire</p>
                        <p class="text-sm text-muted-foreground">Résumé de consommation chaque semaine</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.notifications.weeklyReport" class="sr-only peer">
                        <div
                            class="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Thresholds -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Zap class="h-5 w-5" />
                Seuils d'alerte
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-sm font-medium mb-2">Limite journalière (kWh)</label>
                    <input type="number" v-model="settings.thresholds.dailyLimit"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Pic de puissance max (kW)</label>
                    <input type="number" v-model="settings.thresholds.peakPower"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
            </div>
        </div>

        <!-- Pricing -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4">💰 Tarification</h3>
            <div>
                <label class="block text-sm font-medium mb-2">Prix du kWh (€)</label>
                <input type="number" step="0.01" v-model="settings.display.pricePerKwh"
                    class="w-full max-w-xs px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                <p class="text-xs text-muted-foreground mt-1">Tarif EDF base 2024 : 0.2516 €/kWh</p>
            </div>
        </div>

        <!-- Save Button -->
        <button @click="saveSettings"
            class="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Save class="h-5 w-5" />
            Sauvegarder les paramètres
        </button>
    </div>
</template>
