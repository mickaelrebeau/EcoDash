<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Activity, Plus, Trash2, TrendingUp, Calendar, ShoppingBag, Home, Trash, Film, Package, Plane, Heart, Coffee } from 'lucide-vue-next'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// @ts-ignore - Auto-imported by Nuxt
definePageMeta({
    layout: 'default'
})

// @ts-ignore - Auto-imported by Nuxt (composable)
const { createActivity, getActivities, deleteActivity, getActivityStats, getCategories, getCategoryLabel, getSubcategoryLabel, getSubcategoryUnit, calculateCO2 } = useActivities()

const isLoading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)
const showForm = ref(false)
const selectedCategory = ref('')

// Formulaire de saisie
const activityForm = ref({
    date: new Date().toISOString().slice(0, 10),
    category: '',
    subcategory: '',
    quantity: 1,
    notes: ''
})

// Données
const activities = ref<any[]>([])
const stats = ref<any>(null)
const categories = getCategories()

// Icônes par catégorie
const categoryIcons: Record<string, any> = {
    'purchases': ShoppingBag,
    'housing': Home,
    'waste': Trash,
    'entertainment': Film,
    'services': Package,
    'travel': Plane,
    'health': Heart,
    'food_drinks': Coffee,
}

// Calcul de l'impact CO2 en temps réel
const estimatedCO2 = computed(() => {
    if (!activityForm.value.category || !activityForm.value.subcategory) return 0
    const qty = parseFloat(String(activityForm.value.quantity)) || 1
    return calculateCO2(activityForm.value.category, activityForm.value.subcategory, qty)
})

// Sous-catégories filtrées
const availableSubcategories = computed(() => {
    if (!activityForm.value.category) return []
    const category = categories.find(c => c.value === activityForm.value.category)
    return category?.subcategories || []
})

// Mettre à jour la sous-catégorie quand la catégorie change
watch(() => activityForm.value.category, (newCat) => {
    activityForm.value.subcategory = ''
    if (newCat && availableSubcategories.value.length > 0) {
        activityForm.value.subcategory = availableSubcategories.value[0].value
    }
})

const fetchActivities = async () => {
    try {
        const response = await $fetch<any>('/api/activities')
        activities.value = response.data || []
    } catch (e) {
        console.error('Failed to fetch activities', e)
    }
}

const fetchStats = async () => {
    try {
        const response = await $fetch<any>('/api/activities/stats')
        stats.value = response.data || null
    } catch (e) {
        console.error('Failed to fetch stats', e)
    }
}

const addActivity = async () => {
    if (!activityForm.value.category || !activityForm.value.subcategory) {
        message.value = { type: 'error', text: 'Veuillez sélectionner une catégorie et une sous-catégorie' }
        return
    }

    isLoading.value = true
    try {
        await createActivity({
            date: activityForm.value.date,
            category: activityForm.value.category,
            subcategory: activityForm.value.subcategory,
            quantity: activityForm.value.quantity,
            notes: activityForm.value.notes || undefined
        })

        message.value = { type: 'success', text: 'Activité ajoutée avec succès' }
        activityForm.value.quantity = 1
        activityForm.value.notes = ''
        showForm.value = false
        await fetchActivities()
        await fetchStats()
    } catch (e: any) {
        message.value = { type: 'error', text: e.data?.message || e.message || 'Erreur lors de l\'ajout de l\'activité' }
    } finally {
        isLoading.value = false
    }
}

const removeActivity = async (id: number) => {
    if (!confirm('Supprimer cette activité ?')) return

    try {
        await deleteActivity(id)
        message.value = { type: 'success', text: 'Activité supprimée' }
        await fetchActivities()
        await fetchStats()
    } catch (e: any) {
        message.value = { type: 'error', text: e.data?.message || e.message || 'Erreur lors de la suppression' }
    }
}

// Graphiques
const activitiesByCategoryChartData = computed(() => {
    if (!stats.value?.activitiesByCategory) return null

    const cats = Object.keys(stats.value.activitiesByCategory)
    const labels = cats.map(cat => getCategoryLabel(cat))
    const co2Data = cats.map(cat => stats.value.activitiesByCategory[cat].co2)

    return {
        labels,
        datasets: [{
            label: 'CO₂ (kg)',
            data: co2Data,
            backgroundColor: [
                'rgba(239, 68, 68, 0.7)',
                'rgba(34, 197, 94, 0.7)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(168, 85, 247, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(20, 184, 166, 0.7)',
                'rgba(251, 146, 60, 0.7)',
            ],
            borderRadius: 8
        }]
    }
})

const activitiesByCategoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context: any) => `${context.parsed.y.toFixed(3)} kg CO₂`
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: { display: true, text: 'kg CO₂' }
        }
    }
}

// Charger les données
onMounted(() => {
    fetchActivities()
    fetchStats()
})
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Activity class="h-8 w-8 text-purple-500" />
                <div>
                    <h2 class="text-3xl font-bold tracking-tight">Mes Activités</h2>
                    <p class="text-muted-foreground">Suivez toutes vos activités et leur impact écologique</p>
                </div>
            </div>
            <button @click="showForm = !showForm"
                class="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center gap-2">
                <Plus class="h-4 w-4" />
                Ajouter une activité
            </button>
        </div>

        <!-- Message -->
        <div v-if="message" :class="[
            'p-4 rounded-lg flex items-center justify-between',
            message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/30' : 'bg-red-500/10 text-red-600 border border-red-500/30'
        ]">
            <span>{{ message.text }}</span>
            <button @click="message = null" class="text-lg hover:opacity-70">×</button>
        </div>

        <!-- Formulaire d'ajout -->
        <div v-if="showForm" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Plus class="h-5 w-5" />
                Nouvelle activité
            </h3>

            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="text-sm font-medium mb-2 block">Date</label>
                    <input v-model="activityForm.date" type="date"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Catégorie</label>
                    <select v-model="activityForm.category"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background">
                        <option value="">Sélectionner une catégorie</option>
                        <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                            {{ cat.label }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Type d'activité</label>
                    <select v-model="activityForm.subcategory" :disabled="!activityForm.category"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background disabled:opacity-50">
                        <option value="">Sélectionner un type</option>
                        <option v-for="subcat in availableSubcategories" :key="subcat.value" :value="subcat.value">
                            {{ subcat.label }} ({{ subcat.emission }} {{ subcat.unit }})
                        </option>
                    </select>
                </div>

                <div>
                    <label class="text-sm font-medium mb-2 block">Quantité</label>
                    <input v-model.number="activityForm.quantity" type="number" step="0.1" min="0.1" placeholder="1"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                    <p v-if="activityForm.subcategory" class="text-xs text-muted-foreground mt-1">
                        Unité: {{ getSubcategoryUnit(activityForm.category, activityForm.subcategory) }}
                    </p>
                </div>

                <div class="md:col-span-2">
                    <label class="text-sm font-medium mb-2 block">Notes (optionnel)</label>
                    <input v-model="activityForm.notes" type="text" placeholder="Ex: Achat en ligne"
                        class="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                </div>
            </div>

            <div v-if="estimatedCO2 > 0" class="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p class="text-sm">
                    <strong>Impact estimé :</strong> {{ estimatedCO2 }} kg CO₂
                </p>
            </div>

            <div class="flex gap-3 mt-4">
                <button @click="addActivity" :disabled="isLoading"
                    class="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
                    Ajouter l'activité
                </button>
                <button @click="showForm = false"
                    class="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent">
                    Annuler
                </button>
            </div>
        </div>

        <!-- Statistiques -->
        <div v-if="stats" class="grid gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-border bg-card p-4">
                <div class="flex items-center gap-2 mb-2">
                    <Activity class="h-5 w-5 text-purple-500" />
                    <p class="text-sm text-muted-foreground">Total activités</p>
                </div>
                <p class="text-2xl font-bold">{{ stats.totalActivities }}</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-4">
                <div class="flex items-center gap-2 mb-2">
                    <TrendingUp class="h-5 w-5 text-red-500" />
                    <p class="text-sm text-muted-foreground">CO₂ total</p>
                </div>
                <p class="text-2xl font-bold">{{ stats.totalCO2.toFixed(2) }} kg</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-4">
                <div class="flex items-center gap-2 mb-2">
                    <Calendar class="h-5 w-5 text-purple-500" />
                    <p class="text-sm text-muted-foreground">Moyenne/activité</p>
                </div>
                <p class="text-2xl font-bold">{{ stats.averageCO2PerActivity.toFixed(3) }} kg</p>
            </div>
        </div>

        <!-- Graphique -->
        <div v-if="stats && activitiesByCategoryChartData" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4">Émissions CO₂ par catégorie</h3>
            <div class="h-[400px]">
                <ClientOnly>
                    <Bar :data="activitiesByCategoryChartData" :options="activitiesByCategoryChartOptions" />
                </ClientOnly>
            </div>
        </div>

        <!-- Liste des activités par catégorie -->
        <div v-for="category in categories" :key="category.value" class="rounded-xl border border-border bg-card p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <component :is="categoryIcons[category.value] || Activity" class="h-5 w-5" />
                {{ category.label }}
            </h3>

            <div v-if="activities.filter(a => a.category === category.value).length === 0" 
                class="text-center py-4 text-muted-foreground text-sm">
                Aucune activité enregistrée dans cette catégorie
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-border">
                            <th class="text-left py-2 px-3">Date</th>
                            <th class="text-left py-2 px-3">Type</th>
                            <th class="text-left py-2 px-3">Quantité</th>
                            <th class="text-left py-2 px-3">CO₂</th>
                            <th class="text-left py-2 px-3">Notes</th>
                            <th class="text-right py-2 px-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="activity in activities.filter(a => a.category === category.value)" :key="activity.id"
                            class="border-b border-border/50 hover:bg-accent/50">
                            <td class="py-2 px-3">{{ new Date(activity.date).toLocaleDateString('fr-FR') }}</td>
                            <td class="py-2 px-3">
                                <span class="px-2 py-1 rounded-full text-xs bg-secondary">
                                    {{ getSubcategoryLabel(activity.category, activity.subcategory) }}
                                </span>
                            </td>
                            <td class="py-2 px-3 font-medium">
                                {{ activity.quantity || 1 }} {{ activity.unit || '' }}
                            </td>
                            <td class="py-2 px-3">
                                <span class="font-medium text-red-500">{{ activity.co2_kg.toFixed(3) }} kg</span>
                            </td>
                            <td class="py-2 px-3 text-muted-foreground">{{ activity.notes || '-' }}</td>
                            <td class="py-2 px-3 text-right">
                                <button @click="removeActivity(activity.id)" class="p-1 hover:bg-destructive/10 rounded">
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

