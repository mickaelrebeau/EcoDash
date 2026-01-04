<script setup lang="ts">
import { Wifi, WifiOff, Play, Pause, Settings, CheckCircle, XCircle, Server, Home, Zap } from 'lucide-vue-next'

definePageMeta({
    layout: 'default'
})

const { state, sourceLabel, connect, disconnect, getSourceConfig, setSourceConfig } = useRealtime()

const isLoading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)
const currentConfig = ref<any>({ type: 'simulation', enabled: true, config: {} })

// Form data for different sources
const shellyConfig = ref({
    ip: '192.168.1.100',
    channel: 0
})

const homeAssistantConfig = ref({
    url: 'http://homeassistant.local:8123',
    token: '',
    entityId: 'sensor.power_consumption'
})

const enedisConfig = ref({
    usagePointId: '',
    accessToken: ''
})

const selectedSource = ref('simulation')

const sourceOptions = [
    {
        value: 'simulation',
        label: 'Simulation (Démo)',
        icon: Play,
        description: 'Données simulées pour démonstration',
        color: 'text-blue-500'
    },
    {
        value: 'shelly',
        label: 'Shelly EM / 3EM',
        icon: Wifi,
        description: 'Module de mesure Shelly sur votre réseau local',
        color: 'text-green-500'
    },
    {
        value: 'homeassistant',
        label: 'Home Assistant',
        icon: Home,
        description: 'Via l\'API REST de Home Assistant',
        color: 'text-orange-500'
    },
    {
        value: 'enedis',
        label: 'Enedis Data-Connect',
        icon: Zap,
        description: 'API officielle Enedis (données J-1)',
        color: 'text-purple-500'
    }
]

const loadConfig = async () => {
    const config = await getSourceConfig()
    if (config) {
        currentConfig.value = config
        selectedSource.value = config.type

        if (config.type === 'shelly' && config.config) {
            shellyConfig.value = { ...shellyConfig.value, ...config.config }
        }
        if (config.type === 'homeassistant' && config.config) {
            homeAssistantConfig.value = { ...homeAssistantConfig.value, ...config.config }
        }
        if (config.type === 'enedis' && config.config) {
            enedisConfig.value = { ...enedisConfig.value, ...config.config }
        }
    }
}

const saveConfig = async (testConnection = false) => {
    isLoading.value = true
    message.value = null

    try {
        let config: Record<string, any> = {}

        switch (selectedSource.value) {
            case 'shelly':
                config = { ...shellyConfig.value }
                break
            case 'homeassistant':
                config = { ...homeAssistantConfig.value }
                break
            case 'enedis':
                config = { ...enedisConfig.value }
                break
        }

        await setSourceConfig({
            type: selectedSource.value,
            enabled: true,
            config,
            testConnection
        })

        message.value = {
            type: 'success',
            text: testConnection
                ? 'Connexion testée et configuration sauvegardée !'
                : 'Configuration sauvegardée'
        }

        // Reconnect with new config
        disconnect()
        setTimeout(() => connect(), 500)

    } catch (error: any) {
        message.value = {
            type: 'error',
            text: error.data?.message || error.message || 'Erreur de configuration'
        }
    } finally {
        isLoading.value = false
    }
}

// Load config and connect immediately (works with client-side navigation)
loadConfig()
connect()
</script>

<template>
    <div class="space-y-6 max-w-3xl">
        <div class="flex items-center gap-3">
            <Wifi class="h-8 w-8 text-green-500" />
            <div>
                <h2 class="text-3xl font-bold tracking-tight">Connexion Temps Réel</h2>
                <p class="text-muted-foreground">Configurez votre source de données en direct</p>
            </div>
        </div>

        <!-- Status Banner -->
        <div :class="[
            'p-4 rounded-xl border flex items-center justify-between',
            state.isConnected ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
        ]">
            <div class="flex items-center gap-3">
                <component :is="state.isConnected ? CheckCircle : XCircle"
                    :class="['h-6 w-6', state.isConnected ? 'text-green-500' : 'text-red-500']" />
                <div>
                    <p class="font-medium">{{ state.isConnected ? 'Connecté' : 'Déconnecté' }}</p>
                    <p class="text-sm text-muted-foreground">Source: {{ sourceLabel }}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-muted-foreground">Dernière mise à jour</p>
                <p class="font-mono text-sm">{{ state.lastUpdate ? new Date(state.lastUpdate).toLocaleTimeString() : '-'
                }}</p>
            </div>
        </div>

        <!-- Error Message -->
        <div v-if="state.error" class="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600">
            ⚠️ {{ state.error }}
        </div>

        <!-- Success/Error Message -->
        <div v-if="message" :class="[
            'p-4 rounded-lg',
            message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/30' : 'bg-red-500/10 text-red-600 border border-red-500/30'
        ]">
            {{ message.text }}
            <button @click="message = null" class="float-right">×</button>
        </div>

        <!-- Source Selection -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4">Source de données</h3>

            <div class="grid gap-3 sm:grid-cols-2">
                <button v-for="option in sourceOptions" :key="option.value" @click="selectedSource = option.value"
                    :class="[
                        'p-4 rounded-lg border text-left transition-all',
                        selectedSource === option.value
                            ? 'border-primary bg-primary/5 ring-2 ring-primary'
                            : 'border-border hover:border-primary/50'
                    ]">
                    <div class="flex items-center gap-3 mb-2">
                        <component :is="option.icon" :class="['h-5 w-5', option.color]" />
                        <span class="font-medium">{{ option.label }}</span>
                    </div>
                    <p class="text-xs text-muted-foreground">{{ option.description }}</p>
                </button>
            </div>
        </div>

        <!-- Configuration Forms -->

        <!-- Shelly Config -->
        <div v-if="selectedSource === 'shelly'" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Server class="h-5 w-5" />
                Configuration Shelly
            </h3>

            <div class="space-y-4">
                <div>
                    <label class="text-sm font-medium mb-2 block">Adresse IP du Shelly</label>
                    <input v-model="shellyConfig.ip" type="text" placeholder="192.168.1.100"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    <p class="text-xs text-muted-foreground mt-1">L'IP locale de votre Shelly EM/3EM</p>
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Canal (0-2)</label>
                    <input v-model.number="shellyConfig.channel" type="number" min="0" max="2"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    <p class="text-xs text-muted-foreground mt-1">Canal de mesure (0 pour Shelly EM)</p>
                </div>
            </div>
        </div>

        <!-- Home Assistant Config -->
        <div v-if="selectedSource === 'homeassistant'" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Home class="h-5 w-5" />
                Configuration Home Assistant
            </h3>

            <div class="space-y-4">
                <div>
                    <label class="text-sm font-medium mb-2 block">URL Home Assistant</label>
                    <input v-model="homeAssistantConfig.url" type="text" placeholder="http://homeassistant.local:8123"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Token d'accès (Long-Lived Access Token)</label>
                    <input v-model="homeAssistantConfig.token" type="password" placeholder="eyJhbGciOiJIUzI1NiIs..."
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    <p class="text-xs text-muted-foreground mt-1">
                        Créez un token dans HA: Profil → Tokens d'accès longue durée
                    </p>
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Entity ID du capteur</label>
                    <input v-model="homeAssistantConfig.entityId" type="text" placeholder="sensor.power_consumption"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    <p class="text-xs text-muted-foreground mt-1">L'entité qui mesure la consommation (ex:
                        sensor.shelly_em_power)</p>
                </div>
            </div>
        </div>

        <!-- Enedis Config -->
        <div v-if="selectedSource === 'enedis'" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Zap class="h-5 w-5" />
                Configuration Enedis Data-Connect
            </h3>

            <div class="p-4 bg-yellow-500/10 rounded-lg mb-4 text-sm">
                ⚠️ L'API Enedis nécessite une inscription en tant que fournisseur de services.
                Les données sont disponibles avec un délai de 24h.
            </div>

            <div class="space-y-4">
                <div>
                    <label class="text-sm font-medium mb-2 block">Point de Livraison (PDL)</label>
                    <input v-model="enedisConfig.usagePointId" type="text" placeholder="12345678901234"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    <p class="text-xs text-muted-foreground mt-1">Votre numéro PDL (14 chiffres sur votre facture)</p>
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Access Token</label>
                    <input v-model="enedisConfig.accessToken" type="password" placeholder="Token OAuth2..."
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                </div>
            </div>
        </div>

        <!-- Simulation Info -->
        <div v-if="selectedSource === 'simulation'" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Play class="h-5 w-5" />
                Mode Simulation
            </h3>

            <p class="text-muted-foreground">
                Le mode simulation génère des données réalistes basées sur les profils de consommation français
                typiques.
                Utilisez ce mode pour découvrir l'application ou en attendant de configurer une source réelle.
            </p>

            <div class="mt-4 p-3 bg-secondary/50 rounded-lg text-sm">
                <p class="font-medium mb-2">Caractéristiques de la simulation :</p>
                <ul class="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Pic du matin (7h-9h) : ~2.5 kW</li>
                    <li>Pic du soir (18h-22h) : ~3.5 kW</li>
                    <li>Nuit (23h-6h) : ~0.3 kW</li>
                    <li>Variations aléatoires réalistes</li>
                </ul>
            </div>
        </div>

        <!-- Save Buttons -->
        <div class="flex gap-4">
            <button @click="saveConfig(true)" :disabled="isLoading"
                class="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <CheckCircle class="h-5 w-5" />
                Tester et sauvegarder
            </button>

            <button @click="saveConfig(false)" :disabled="isLoading"
                class="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-accent disabled:opacity-50">
                Sauvegarder
            </button>
        </div>
    </div>
</template>
