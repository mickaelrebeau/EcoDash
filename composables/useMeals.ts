// Facteurs d'émission CO2 par type de repas (en kg CO2/repas)
// Sources : ADEME, Base Carbone, études sur l'empreinte carbone alimentaire
const CO2_EMISSION_FACTORS: Record<string, number> = {
    // Fast Food
    'fastfood_burger': 3.5,        // Burger fast food
    'fastfood_pizza': 3.2,          // Pizza fast food
    'fastfood_sandwich': 2.8,        // Sandwich fast food
    'fastfood_fries': 1.5,           // Frites seules
    'fastfood_salad': 2.0,           // Salade fast food
    'fastfood_chicken': 3.0,         // Poulet frit fast food
    'fastfood_other': 3.0,           // Autre fast food
    
    // Restaurant
    'restaurant_meat': 4.5,          // Plat avec viande au restaurant
    'restaurant_fish': 3.5,          // Plat avec poisson au restaurant
    'restaurant_vegetarian': 2.5,    // Plat végétarien au restaurant
    'restaurant_vegan': 2.0,         // Plat végan au restaurant
    'restaurant_pizza': 3.0,         // Pizza au restaurant
    'restaurant_salad': 2.2,         // Salade au restaurant
    'restaurant_other': 3.0,         // Autre plat restaurant
    
    // Cuisine maison
    'home_meat': 2.5,                // Plat avec viande maison
    'home_fish': 2.0,                // Plat avec poisson maison
    'home_vegetarian': 1.5,          // Plat végétarien maison
    'home_vegan': 1.2,               // Plat végan maison
    'home_pasta': 1.3,               // Pâtes maison
    'home_salad': 1.0,               // Salade maison
    'home_soup': 1.2,                // Soupe maison
    'home_sandwich': 1.5,            // Sandwich maison
    'home_other': 1.8,               // Autre plat maison
}

export interface Meal {
    id?: number
    date: string
    meal_type: string  // 'breakfast', 'lunch', 'dinner', 'snack'
    meal_category: string
    co2_kg: number
    notes?: string
    created_at?: string
}

export interface MealInput {
    date: string
    meal_type: string
    meal_category: string
    notes?: string
}

export interface MealStats {
    totalMeals: number
    totalCO2: number
    averageCO2PerMeal: number
    mealsByType: Record<string, { count: number; co2: number }>
    mealsByCategory: Record<string, { count: number; co2: number }>
}

export const useMeals = () => {
    const calculateCO2 = (mealCategory: string): number => {
        return CO2_EMISSION_FACTORS[mealCategory] || 2.0 // Valeur par défaut
    }

    const getMealCategoryLabel = (category: string): string => {
        const labels: Record<string, string> = {
            // Fast Food
            'fastfood_burger': 'Burger fast food',
            'fastfood_pizza': 'Pizza fast food',
            'fastfood_sandwich': 'Sandwich fast food',
            'fastfood_fries': 'Frites',
            'fastfood_salad': 'Salade fast food',
            'fastfood_chicken': 'Poulet frit',
            'fastfood_other': 'Autre fast food',
            
            // Restaurant
            'restaurant_meat': 'Plat viande (restaurant)',
            'restaurant_fish': 'Plat poisson (restaurant)',
            'restaurant_vegetarian': 'Plat végétarien (restaurant)',
            'restaurant_vegan': 'Plat végan (restaurant)',
            'restaurant_pizza': 'Pizza (restaurant)',
            'restaurant_salad': 'Salade (restaurant)',
            'restaurant_other': 'Autre plat (restaurant)',
            
            // Cuisine maison
            'home_meat': 'Plat viande (maison)',
            'home_fish': 'Plat poisson (maison)',
            'home_vegetarian': 'Plat végétarien (maison)',
            'home_vegan': 'Plat végan (maison)',
            'home_pasta': 'Pâtes (maison)',
            'home_salad': 'Salade (maison)',
            'home_soup': 'Soupe (maison)',
            'home_sandwich': 'Sandwich (maison)',
            'home_other': 'Autre plat (maison)',
        }
        return labels[category] || category
    }

    const getMealTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'breakfast': 'Petit-déjeuner',
            'lunch': 'Déjeuner',
            'dinner': 'Dîner',
            'snack': 'Collation'
        }
        return labels[type] || type
    }

    const getMealCategories = (): Array<{ value: string; label: string; emission: number; group: string }> => {
        return [
            // Fast Food
            { value: 'fastfood_burger', label: 'Burger fast food', emission: 3.5, group: 'Fast Food' },
            { value: 'fastfood_pizza', label: 'Pizza fast food', emission: 3.2, group: 'Fast Food' },
            { value: 'fastfood_sandwich', label: 'Sandwich fast food', emission: 2.8, group: 'Fast Food' },
            { value: 'fastfood_fries', label: 'Frites', emission: 1.5, group: 'Fast Food' },
            { value: 'fastfood_salad', label: 'Salade fast food', emission: 2.0, group: 'Fast Food' },
            { value: 'fastfood_chicken', label: 'Poulet frit', emission: 3.0, group: 'Fast Food' },
            { value: 'fastfood_other', label: 'Autre fast food', emission: 3.0, group: 'Fast Food' },
            
            // Restaurant
            { value: 'restaurant_meat', label: 'Plat viande', emission: 4.5, group: 'Restaurant' },
            { value: 'restaurant_fish', label: 'Plat poisson', emission: 3.5, group: 'Restaurant' },
            { value: 'restaurant_vegetarian', label: 'Plat végétarien', emission: 2.5, group: 'Restaurant' },
            { value: 'restaurant_vegan', label: 'Plat végan', emission: 2.0, group: 'Restaurant' },
            { value: 'restaurant_pizza', label: 'Pizza', emission: 3.0, group: 'Restaurant' },
            { value: 'restaurant_salad', label: 'Salade', emission: 2.2, group: 'Restaurant' },
            { value: 'restaurant_other', label: 'Autre plat', emission: 3.0, group: 'Restaurant' },
            
            // Cuisine maison
            { value: 'home_meat', label: 'Plat viande', emission: 2.5, group: 'Cuisine maison' },
            { value: 'home_fish', label: 'Plat poisson', emission: 2.0, group: 'Cuisine maison' },
            { value: 'home_vegetarian', label: 'Plat végétarien', emission: 1.5, group: 'Cuisine maison' },
            { value: 'home_vegan', label: 'Plat végan', emission: 1.2, group: 'Cuisine maison' },
            { value: 'home_pasta', label: 'Pâtes', emission: 1.3, group: 'Cuisine maison' },
            { value: 'home_salad', label: 'Salade', emission: 1.0, group: 'Cuisine maison' },
            { value: 'home_soup', label: 'Soupe', emission: 1.2, group: 'Cuisine maison' },
            { value: 'home_sandwich', label: 'Sandwich', emission: 1.5, group: 'Cuisine maison' },
            { value: 'home_other', label: 'Autre plat', emission: 1.8, group: 'Cuisine maison' },
        ]
    }

    const createMeal = async (mealInput: MealInput): Promise<Meal> => {
        const co2_kg = calculateCO2(mealInput.meal_category)
        const meal: Meal = {
            ...mealInput,
            co2_kg
        }
        return await $fetch<Meal>('/api/meals', {
            method: 'POST',
            body: meal
        })
    }

    const getMeals = async (startDate?: string, endDate?: string): Promise<Meal[]> => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        const query = params.toString()
        return await $fetch<Meal[]>(`/api/meals${query ? `?${query}` : ''}`)
    }

    const deleteMeal = async (id: number): Promise<void> => {
        await $fetch(`/api/meals/${id}`, {
            method: 'DELETE'
        })
    }

    const getMealStats = async (startDate?: string, endDate?: string): Promise<MealStats> => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        const query = params.toString()
        return await $fetch<MealStats>(`/api/meals/stats${query ? `?${query}` : ''}`)
    }

    return {
        calculateCO2,
        getMealCategoryLabel,
        getMealTypeLabel,
        getMealCategories,
        createMeal,
        getMeals,
        deleteMeal,
        getMealStats,
        CO2_EMISSION_FACTORS
    }
}

