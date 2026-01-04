<script setup lang="ts">
import { Upload, Database, Plus, Trash2, Download, RefreshCw, FileText } from 'lucide-vue-next'

definePageMeta({
    layout: 'default'
})

const isLoading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

// Manual entry form
const manualEntry = ref({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toISOString().slice(11, 16),
    value: '',
    type: 'electricity'
})

// Stats
const stats = ref<any>(null)
const recentReadings = ref<any[]>([])

// File upload
const fileInput = ref<HTMLInputElement | null>(null)
const importFormat = ref('linky')

const fetchStats = async () => {
    try {
        const response = await $fetch('/api/readings/stats?days=30&period=day')
        stats.value = response
    } catch (e) {
        console.error('Failed to fetch stats', e)
    }
}

const fetchRecentReadings = async () => {
    try {
        const response = await $fetch<any>('/api/readings?limit=20')
        recentReadings.value = response.data
    } catch (e) {
        console.error('Failed to fetch readings', e)
    }
}

const addManualReading = async () => {
    if (!manualEntry.value.value) {
        message.value = { type: 'error', text: 'Veuillez entrer une valeur' }
        return
    }

    isLoading.value = true
    try {
        const timestamp = new Date(`${manualEntry.value.date}T${manualEntry.value.time}`).toISOString()
        await $fetch('/api/readings', {
            method: 'POST',
            body: {
                timestamp,
                value: parseFloat(manualEntry.value.value),
                type: manualEntry.value.type,
                source: 'manual'
            }
        })

        message.value = { type: 'success', text: 'Relevé ajouté avec succès' }
        manualEntry.value.value = ''
        await fetchRecentReadings()
        await fetchStats()
    } catch (e: any) {
        message.value = { type: 'error', text: e.message }
    } finally {
        isLoading.value = false
    }
}

const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    isLoading.value = true
    try {
        const data = await file.text()
        const response = await $fetch<any>('/api/readings/import', {
            method: 'POST',
            body: {
                data,
                format: importFormat.value
            }
        })

        message.value = { type: 'success', text: response.message }
        await fetchRecentReadings()
        await fetchStats()
    } catch (e: any) {
        message.value = { type: 'error', text: `Erreur d'import: ${e.data?.message || e.message}` }
    } finally {
        isLoading.value = false
        if (fileInput.value) fileInput.value.value = ''
    }
}

const generateDemoData = async () => {
    if (!confirm('Cela va remplacer toutes les données existantes. Continuer ?')) return

    isLoading.value = true
    try {
        const response = await $fetch<any>('/api/readings/generate-demo', {
            method: 'POST',
            body: { days: 90, clearExisting: true }
        })

        message.value = { type: 'success', text: response.message }
        await fetchRecentReadings()
        await fetchStats()
    } catch (e: any) {
        message.value = { type: 'error', text: e.message }
    } finally {
        isLoading.value = false
    }
}

const clearAllData = async () => {
    if (!confirm('Supprimer TOUTES les données ? Cette action est irréversible.')) return

    isLoading.value = true
    try {
        await $fetch('/api/readings?before=' + new Date().toISOString(), {
            method: 'DELETE'
        })

        message.value = { type: 'success', text: 'Toutes les données ont été supprimées' }
        recentReadings.value = []
        stats.value = null
    } catch (e: any) {
        message.value = { type: 'error', text: e.message }
    } finally {
        isLoading.value = false
    }
}

const deleteReading = async (id: number) => {
    try {
        await $fetch(`/api/readings?id=${id}`, { method: 'DELETE' })
        await fetchRecentReadings()
        await fetchStats()
    } catch (e) {
        console.error('Failed to delete', e)
    }
}

// Load data immediately (works with client-side navigation)
fetchStats()
fetchRecentReadings()
</script>

<template>
    <div class="space-y-6 max-w-5xl">
        <div class="flex items-center gap-3">
            <Database class="h-8 w-8 text-blue-500" />
            <div>
                <h2 class="text-3xl font-bold tracking-tight">Gestion des données</h2>
                <p class="text-muted-foreground">Importez, ajoutez et gérez vos relevés de consommation</p>
            </div>
        </div>

        <!-- Message -->
        <div v-if="message" :class="[
            'p-4 rounded-lg',
            message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/30' : 'bg-red-500/10 text-red-600 border border-red-500/30'
        ]">
            {{ message.text }}
            <button @click="message = null" class="float-right">×</button>
        </div>

        <!-- Stats Summary -->
        <div v-if="stats?.summary" class="grid gap-4 md:grid-cols-4">
            <div class="rounded-xl border border-border bg-card p-4">
                <p class="text-sm text-muted-foreground">Total (30j)</p>
                <p class="text-2xl font-bold">{{ stats.summary.totalKwh }} kWh</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-4">
                <p class="text-sm text-muted-foreground">Moyenne/jour</p>
                <p class="text-2xl font-bold">{{ stats.summary.avgDailyKwh?.toFixed(1) }} kWh</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-4">
                <p class="text-sm text-muted-foreground">Pic max</p>
                <p class="text-2xl font-bold">{{ stats.summary.peakKw }} kW</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-4">
                <p class="text-sm text-muted-foreground">Nb relevés</p>
                <p class="text-2xl font-bold">{{ stats.summary.readingsCount }}</p>
            </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
            <!-- Import CSV -->
            <div class="rounded-xl border border-border bg-card p-6">
                <h3 class="font-semibold mb-4 flex items-center gap-2">
                    <Upload class="h-5 w-5" />
                    Importer des données
                </h3>

                <div class="space-y-4">
                    <div>
                        <label class="text-sm font-medium mb-2 block">Fournisseur / Format</label>
                        <select v-model="importFormat"
                            class="w-full px-4 py-2 rounded-lg border border-input bg-background">
                            <optgroup label="Enedis / Linky">
                                <option value="linky">Export Linky standard</option>
                                <option value="enedis">Enedis CSV détaillé</option>
                            </optgroup>
                            <optgroup label="TotalEnergies">
                                <option value="totalenergies">TotalEnergies (Espace client)</option>
                            </optgroup>
                            <optgroup label="EDF">
                                <option value="edf">EDF - Export mensuel</option>
                                <option value="edf_detail">EDF - Détail 30 minutes</option>
                            </optgroup>
                            <optgroup label="Autre">
                                <option value="generic">CSV générique (date, value)</option>
                            </optgroup>
                        </select>
                    </div>

                    <div>
                        <label class="text-sm font-medium mb-2 block">Fichier CSV</label>
                        <input ref="fileInput" type="file" accept=".csv,.json,.txt,.xlsx" @change="handleFileUpload"
                            class="w-full px-4 py-2 rounded-lg border border-input bg-background file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground" />
                    </div>

                    <div class="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-1">
                        <p class="font-medium text-foreground">📥 Où télécharger vos données ?</p>
                        <p>• <a href="https://mon-compte-particulier.enedis.fr" target="_blank"
                                class="text-primary hover:underline">Enedis</a> - Espace particulier → Suivre mes
                            mesures → Télécharger mes données</p>
                        <p>• <a href="https://www.totalenergies.fr/clients/espace-client" target="_blank"
                                class="text-primary hover:underline">TotalEnergies</a> - Espace client → Ma conso →
                            Exporter</p>
                        <p>• <a href="https://particulier.edf.fr/fr/accueil/espace-client.html" target="_blank"
                                class="text-primary hover:underline">EDF</a> - Espace client → Conso & factures →
                            Historique conso</p>
                    </div>
                </div>
            </div>

            <!-- Manual Entry -->
            <div class="rounded-xl border border-border bg-card p-6">
                <h3 class="font-semibold mb-4 flex items-center gap-2">
                    <Plus class="h-5 w-5" />
                    Saisie manuelle
                </h3>

                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium mb-2 block">Date</label>
                            <input v-model="manualEntry.date" type="date"
                                class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                        </div>
                        <div>
                            <label class="text-sm font-medium mb-2 block">Heure</label>
                            <input v-model="manualEntry.time" type="time"
                                class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                        </div>
                    </div>

                    <div>
                        <label class="text-sm font-medium mb-2 block">Consommation (kWh)</label>
                        <input v-model="manualEntry.value" type="number" step="0.01" placeholder="Ex: 1.25"
                            class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    </div>

                    <button @click="addManualReading" :disabled="isLoading"
                        class="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
                        Ajouter le relevé
                    </button>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 flex-wrap">
            <button @click="generateDemoData" :disabled="isLoading"
                class="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                <RefreshCw class="h-4 w-4" />
                Générer données démo (90j)
            </button>

            <button @click="clearAllData" :disabled="isLoading"
                class="px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 disabled:opacity-50 flex items-center gap-2">
                <Trash2 class="h-4 w-4" />
                Supprimer toutes les données
            </button>
        </div>

        <!-- Recent Readings -->
        <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <FileText class="h-5 w-5" />
                Derniers relevés
            </h3>

            <div v-if="recentReadings.length === 0" class="text-center py-8 text-muted-foreground">
                <Database class="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucune donnée</p>
                <p class="text-sm">Importez des données ou générez des données de démonstration</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-border">
                            <th class="text-left py-2 px-3">Date/Heure</th>
                            <th class="text-left py-2 px-3">Valeur</th>
                            <th class="text-left py-2 px-3">Type</th>
                            <th class="text-left py-2 px-3">Source</th>
                            <th class="text-right py-2 px-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="reading in recentReadings" :key="reading.id"
                            class="border-b border-border/50 hover:bg-accent/50">
                            <td class="py-2 px-3">{{ new Date(reading.timestamp).toLocaleString('fr-FR') }}</td>
                            <td class="py-2 px-3 font-medium">{{ reading.value }} {{ reading.unit }}</td>
                            <td class="py-2 px-3">{{ reading.type }}</td>
                            <td class="py-2 px-3">
                                <span class="px-2 py-0.5 rounded-full text-xs bg-secondary">{{ reading.source }}</span>
                            </td>
                            <td class="py-2 px-3 text-right">
                                <button @click="deleteReading(reading.id)" class="p-1 hover:bg-destructive/10 rounded">
                                    <Trash2 class="h-4 w-4 text-destructive" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
