// Facteurs d'émission CO2 pour toutes les catégories d'activités
// Sources : ADEME Base Carbone, Carbon Trust, EPA, études scientifiques

// Structure: { category: { subcategory: { emission: number, unit: string, description: string } } }
const ACTIVITY_EMISSION_FACTORS: Record<string, Record<string, { emission: number; unit: string; description: string }>> = {
    // 1. ACHATS & CONSOMMATION
    'purchases': {
        'clothing_jeans': { emission: 33.4, unit: 'kg CO₂/unité', description: 'Jeans' },
        'clothing_tshirt': { emission: 7.0, unit: 'kg CO₂/unité', description: 'T-shirt' },
        'clothing_shoes': { emission: 13.6, unit: 'kg CO₂/unité', description: 'Chaussures' },
        'clothing_jacket': { emission: 25.0, unit: 'kg CO₂/unité', description: 'Veste' },
        'electronics_smartphone': { emission: 55.0, unit: 'kg CO₂/unité', description: 'Smartphone' },
        'electronics_laptop': { emission: 331.0, unit: 'kg CO₂/unité', description: 'Ordinateur portable' },
        'electronics_tablet': { emission: 130.0, unit: 'kg CO₂/unité', description: 'Tablette' },
        'electronics_tv': { emission: 638.0, unit: 'kg CO₂/unité', description: 'Télévision' },
        'household_detergent': { emission: 1.2, unit: 'kg CO₂/litre', description: 'Détergent' },
        'household_cleaning': { emission: 0.8, unit: 'kg CO₂/litre', description: 'Produit nettoyant' },
        'media_book': { emission: 1.0, unit: 'kg CO₂/livre', description: 'Livre papier' },
        'media_magazine': { emission: 0.3, unit: 'kg CO₂/magazine', description: 'Magazine' },
    },

    // 2. LOGEMENT & ÉNERGIE
    'housing': {
        'heating_gas': { emission: 0.206, unit: 'kg CO₂/kWh', description: 'Chauffage au gaz' },
        'heating_oil': { emission: 0.264, unit: 'kg CO₂/kWh', description: 'Chauffage au fioul' },
        'heating_wood': { emission: 0.030, unit: 'kg CO₂/kWh', description: 'Chauffage au bois' },
        'heating_electric': { emission: 0.0569, unit: 'kg CO₂/kWh', description: 'Chauffage électrique' },
        'hot_water': { emission: 0.0569, unit: 'kg CO₂/kWh', description: 'Eau chaude sanitaire' },
        'cooling_ac': { emission: 0.0569, unit: 'kg CO₂/kWh', description: 'Climatisation' },
        'lighting_led': { emission: 0.0000569, unit: 'kg CO₂/kWh', description: 'Éclairage LED' },
        'lighting_incandescent': { emission: 0.000569, unit: 'kg CO₂/kWh', description: 'Éclairage incandescent' },
    },

    // 3. DÉCHETS
    'waste': {
        'waste_mixed': { emission: 0.5, unit: 'kg CO₂/kg', description: 'Déchets mixtes' },
        'waste_recycled': { emission: 0.1, unit: 'kg CO₂/kg', description: 'Déchets recyclés' },
        'waste_composted': { emission: 0.05, unit: 'kg CO₂/kg', description: 'Déchets compostés' },
        'waste_organic': { emission: 0.3, unit: 'kg CO₂/kg', description: 'Déchets organiques' },
    },

    // 4. LOISIRS & DIVERTISSEMENT
    'entertainment': {
        'streaming_hd': { emission: 0.00036, unit: 'kg CO₂/heure', description: 'Streaming HD (Netflix, YouTube)' },
        'streaming_4k': { emission: 0.0007, unit: 'kg CO₂/heure', description: 'Streaming 4K' },
        'gaming_console': { emission: 0.12, unit: 'kg CO₂/heure', description: 'Jeu vidéo console' },
        'gaming_pc': { emission: 0.15, unit: 'kg CO₂/heure', description: 'Jeu vidéo PC' },
        'event_concert': { emission: 5.0, unit: 'kg CO₂/événement', description: 'Concert' },
        'event_festival': { emission: 15.0, unit: 'kg CO₂/événement', description: 'Festival' },
        'event_cinema': { emission: 0.5, unit: 'kg CO₂/séance', description: 'Cinéma' },
    },

    // 5. SERVICES & ABONNEMENTS
    'services': {
        'internet_data': { emission: 0.00005, unit: 'kg CO₂/GB', description: 'Données internet' },
        'delivery_parcel': { emission: 0.5, unit: 'kg CO₂/colis', description: 'Colis livré' },
        'delivery_food': { emission: 1.2, unit: 'kg CO₂/livraison', description: 'Livraison repas' },
        'service_home_cleaning': { emission: 2.0, unit: 'kg CO₂/service', description: 'Service ménage' },
        'service_gardening': { emission: 1.5, unit: 'kg CO₂/service', description: 'Service jardinage' },
    },

    // 6. VOYAGES & VACANCES
    'travel': {
        'hotel_night': { emission: 15.0, unit: 'kg CO₂/nuit', description: 'Nuit d\'hôtel' },
        'car_rental': { emission: 0.12, unit: 'kg CO₂/km', description: 'Location voiture' },
        'cruise_day': { emission: 250.0, unit: 'kg CO₂/jour', description: 'Jour de croisière' },
        'activity_museum': { emission: 0.5, unit: 'kg CO₂/visite', description: 'Musée' },
        'activity_theme_park': { emission: 2.0, unit: 'kg CO₂/visite', description: 'Parc d\'attractions' },
    },

    // 7. SANTÉ & BIEN-ÊTRE
    'health': {
        'medication_prescription': { emission: 0.5, unit: 'kg CO₂/boîte', description: 'Médicament prescrit' },
        'medical_consultation': { emission: 1.0, unit: 'kg CO₂/consultation', description: 'Consultation médicale' },
        'sports_equipment': { emission: 10.0, unit: 'kg CO₂/équipement', description: 'Équipement sportif' },
    },

    // 8. ALIMENTATION (compléments)
    'food_drinks': {
        'drink_coffee': { emission: 0.2, unit: 'kg CO₂/tasse', description: 'Café' },
        'drink_tea': { emission: 0.05, unit: 'kg CO₂/tasse', description: 'Thé' },
        'drink_soda': { emission: 0.3, unit: 'kg CO₂/canette', description: 'Soda' },
        'drink_bottled_water': { emission: 0.15, unit: 'kg CO₂/bouteille', description: 'Eau en bouteille' },
        'delivery_food_order': { emission: 1.5, unit: 'kg CO₂/commande', description: 'Commande livrée' },
        'shopping_grocery': { emission: 0.1, unit: 'kg CO₂/km', description: 'Course (transport)' },
    },

    // 9. TRANSPORTS (TRAJETS)
    'trips': {
        'car_petrol': { emission: 0.12, unit: 'kg CO₂/km', description: 'Voiture essence' },
        'car_diesel': { emission: 0.13, unit: 'kg CO₂/km', description: 'Voiture diesel' },
        'car_electric': { emission: 0.02, unit: 'kg CO₂/km', description: 'Voiture électrique' },
        'car_hybrid': { emission: 0.08, unit: 'kg CO₂/km', description: 'Voiture hybride' },
        'bus': { emission: 0.089, unit: 'kg CO₂/km', description: 'Bus' },
        'tram': { emission: 0.003, unit: 'kg CO₂/km', description: 'Tramway' },
        'metro': { emission: 0.0035, unit: 'kg CO₂/km', description: 'Métro' },
        'train_regional': { emission: 0.014, unit: 'kg CO₂/km', description: 'Train régional' },
        'train_tgv': { emission: 0.0027, unit: 'kg CO₂/km', description: 'TGV' },
        'train_ter': { emission: 0.014, unit: 'kg CO₂/km', description: 'TER' },
        'bike': { emission: 0, unit: 'kg CO₂/km', description: 'Vélo' },
        'walking': { emission: 0, unit: 'kg CO₂/km', description: 'Marche à pied' },
        'scooter': { emission: 0, unit: 'kg CO₂/km', description: 'Trottinette' },
        'motorcycle': { emission: 0.113, unit: 'kg CO₂/km', description: 'Moto' },
        'plane_short': { emission: 0.285, unit: 'kg CO₂/km', description: 'Avion (courte distance)' },
        'plane_long': { emission: 0.18, unit: 'kg CO₂/km', description: 'Avion (longue distance)' },
    },

    // 10. REPAS
    'meals': {
        // Fast Food
        'fastfood_burger': { emission: 3.5, unit: 'kg CO₂/repas', description: 'Burger fast food' },
        'fastfood_pizza': { emission: 3.2, unit: 'kg CO₂/repas', description: 'Pizza fast food' },
        'fastfood_sandwich': { emission: 2.8, unit: 'kg CO₂/repas', description: 'Sandwich fast food' },
        'fastfood_fries': { emission: 1.5, unit: 'kg CO₂/repas', description: 'Frites' },
        'fastfood_salad': { emission: 2.0, unit: 'kg CO₂/repas', description: 'Salade fast food' },
        'fastfood_chicken': { emission: 3.0, unit: 'kg CO₂/repas', description: 'Poulet frit' },
        'fastfood_other': { emission: 3.0, unit: 'kg CO₂/repas', description: 'Autre fast food' },
        
        // Restaurant
        'restaurant_meat': { emission: 4.5, unit: 'kg CO₂/repas', description: 'Plat viande (restaurant)' },
        'restaurant_fish': { emission: 3.5, unit: 'kg CO₂/repas', description: 'Plat poisson (restaurant)' },
        'restaurant_vegetarian': { emission: 2.5, unit: 'kg CO₂/repas', description: 'Plat végétarien (restaurant)' },
        'restaurant_vegan': { emission: 2.0, unit: 'kg CO₂/repas', description: 'Plat végan (restaurant)' },
        'restaurant_pizza': { emission: 3.0, unit: 'kg CO₂/repas', description: 'Pizza (restaurant)' },
        'restaurant_salad': { emission: 2.2, unit: 'kg CO₂/repas', description: 'Salade (restaurant)' },
        'restaurant_other': { emission: 3.0, unit: 'kg CO₂/repas', description: 'Autre plat (restaurant)' },
        
        // Cuisine maison
        'home_meat': { emission: 2.5, unit: 'kg CO₂/repas', description: 'Plat viande (maison)' },
        'home_fish': { emission: 2.0, unit: 'kg CO₂/repas', description: 'Plat poisson (maison)' },
        'home_vegetarian': { emission: 1.5, unit: 'kg CO₂/repas', description: 'Plat végétarien (maison)' },
        'home_vegan': { emission: 1.2, unit: 'kg CO₂/repas', description: 'Plat végan (maison)' },
        'home_pasta': { emission: 1.3, unit: 'kg CO₂/repas', description: 'Pâtes (maison)' },
        'home_salad': { emission: 1.0, unit: 'kg CO₂/repas', description: 'Salade (maison)' },
        'home_soup': { emission: 1.2, unit: 'kg CO₂/repas', description: 'Soupe (maison)' },
        'home_sandwich': { emission: 1.5, unit: 'kg CO₂/repas', description: 'Sandwich (maison)' },
        'home_other': { emission: 1.8, unit: 'kg CO₂/repas', description: 'Autre plat (maison)' },
    },
}

export interface Activity {
    id?: number
    date: string
    category: string
    subcategory: string
    quantity?: number
    unit?: string
    co2_kg: number
    notes?: string
    created_at?: string
}

export interface ActivityInput {
    date: string
    category: string
    subcategory: string
    quantity?: number
    notes?: string
}

export interface ActivityStats {
    totalActivities: number
    totalCO2: number
    averageCO2PerActivity: number
    activitiesByCategory: Record<string, { count: number; co2: number }>
    activitiesBySubcategory: Record<string, { count: number; co2: number }>
}

export const useActivities = () => {
    const calculateCO2 = (category: string, subcategory: string, quantity: number = 1): number => {
        const categoryData = ACTIVITY_EMISSION_FACTORS[category]
        if (!categoryData) return 0
        
        const subcategoryData = categoryData[subcategory]
        if (!subcategoryData) return 0
        
        return Number((subcategoryData.emission * quantity).toFixed(3))
    }

    const getCategoryLabel = (category: string): string => {
        const labels: Record<string, string> = {
            'purchases': 'Achats & Consommation',
            'housing': 'Logement & Énergie',
            'waste': 'Déchets',
            'entertainment': 'Loisirs & Divertissement',
            'services': 'Services & Abonnements',
            'travel': 'Voyages & Vacances',
            'health': 'Santé & Bien-être',
            'food_drinks': 'Boissons & Compléments',
            'trips': 'Transports',
            'meals': 'Repas',
        }
        return labels[category] || category
    }

    const getSubcategoryLabel = (category: string, subcategory: string): string => {
        const subcategoryData = ACTIVITY_EMISSION_FACTORS[category]?.[subcategory]
        return subcategoryData?.description || subcategory
    }

    const getSubcategoryUnit = (category: string, subcategory: string): string => {
        const subcategoryData = ACTIVITY_EMISSION_FACTORS[category]?.[subcategory]
        return subcategoryData?.unit || 'unité'
    }

    const getCategories = (): Array<{ value: string; label: string; subcategories: Array<{ value: string; label: string; unit: string; emission: number }> }> => {
        return Object.entries(ACTIVITY_EMISSION_FACTORS).map(([category, subcategories]) => ({
            value: category,
            label: getCategoryLabel(category),
            subcategories: Object.entries(subcategories).map(([subcat, data]) => ({
                value: subcat,
                label: data.description,
                unit: data.unit,
                emission: data.emission
            }))
        }))
    }

    const createActivity = async (activityInput: ActivityInput): Promise<Activity> => {
        const quantity = activityInput.quantity || 1
        const co2_kg = calculateCO2(activityInput.category, activityInput.subcategory, quantity)
        const unit = getSubcategoryUnit(activityInput.category, activityInput.subcategory)
        
        const activity: Activity = {
            ...activityInput,
            quantity,
            unit,
            co2_kg
        }
        return await $fetch<Activity>('/api/activities', {
            method: 'POST',
            body: activity
        })
    }

    const getActivities = async (startDate?: string, endDate?: string): Promise<Activity[]> => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        const query = params.toString()
        return await $fetch<Activity[]>(`/api/activities${query ? `?${query}` : ''}`)
    }

    const deleteActivity = async (id: number): Promise<void> => {
        await $fetch(`/api/activities/${id}`, {
            method: 'DELETE'
        })
    }

    const getActivityStats = async (startDate?: string, endDate?: string): Promise<ActivityStats> => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        const query = params.toString()
        return await $fetch<ActivityStats>(`/api/activities/stats${query ? `?${query}` : ''}`)
    }

    return {
        calculateCO2,
        getCategoryLabel,
        getSubcategoryLabel,
        getSubcategoryUnit,
        getCategories,
        createActivity,
        getActivities,
        deleteActivity,
        getActivityStats,
        ACTIVITY_EMISSION_FACTORS
    }
}

