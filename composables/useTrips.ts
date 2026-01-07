// Facteurs d'émission CO2 par mode de transport (en g CO2/km)
// Sources : ADEME, Base Carbone
const CO2_EMISSION_FACTORS: Record<string, number> = {
    'car_petrol': 120,      // Voiture essence
    'car_diesel': 130,      // Voiture diesel
    'car_electric': 20,     // Voiture électrique (mix énergétique français)
    'car_hybrid': 80,       // Voiture hybride
    'bus': 89,              // Bus urbain
    'tram': 3,              // Tramway
    'metro': 3.5,           // Métro
    'train_regional': 14,   // Train régional
    'train_tgv': 2.7,       // TGV
    'train_ter': 14,        // TER
    'bike': 0,              // Vélo
    'walking': 0,           // Marche à pied
    'scooter': 0,           // Trottinette
    'motorcycle': 113,      // Moto
    'plane_short': 285,     // Avion (courte distance)
    'plane_long': 180,      // Avion (longue distance)
}

export interface Trip {
    id?: number
    date: string
    transport_mode: string
    distance: number
    co2_kg: number
    notes?: string
    created_at?: string
}

export interface TripInput {
    date: string
    transport_mode: string
    distance: number
    notes?: string
}

export interface TripStats {
    totalTrips: number
    totalDistance: number
    totalCO2: number
    averageCO2PerTrip: number
    tripsByMode: Record<string, { count: number; distance: number; co2: number }>
}

export const useTrips = () => {
    const calculateCO2 = (transportMode: string, distanceKm: number): number => {
        const factor = CO2_EMISSION_FACTORS[transportMode] || 0
        // Convertir de g CO2/km en kg CO2
        return Number(((factor * distanceKm) / 1000).toFixed(3))
    }

    const getTransportModeLabel = (mode: string): string => {
        const labels: Record<string, string> = {
            'car_petrol': 'Voiture essence',
            'car_diesel': 'Voiture diesel',
            'car_electric': 'Voiture électrique',
            'car_hybrid': 'Voiture hybride',
            'bus': 'Bus',
            'tram': 'Tramway',
            'metro': 'Métro',
            'train_regional': 'Train régional',
            'train_tgv': 'TGV',
            'train_ter': 'TER',
            'bike': 'Vélo',
            'walking': 'Marche à pied',
            'scooter': 'Trottinette',
            'motorcycle': 'Moto',
            'plane_short': 'Avion (courte distance)',
            'plane_long': 'Avion (longue distance)',
        }
        return labels[mode] || mode
    }

    const getTransportModes = (): Array<{ value: string; label: string; emission: number }> => {
        return Object.entries(CO2_EMISSION_FACTORS).map(([value, emission]) => ({
            value,
            label: getTransportModeLabel(value),
            emission
        })).sort((a, b) => a.emission - b.emission)
    }

    const createTrip = async (tripInput: TripInput): Promise<Trip> => {
        const co2_kg = calculateCO2(tripInput.transport_mode, tripInput.distance)
        const trip: Trip = {
            ...tripInput,
            co2_kg
        }
        return await $fetch<Trip>('/api/trips', {
            method: 'POST',
            body: trip
        })
    }

    const getTrips = async (startDate?: string, endDate?: string): Promise<Trip[]> => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        const query = params.toString()
        return await $fetch<Trip[]>(`/api/trips${query ? `?${query}` : ''}`)
    }

    const deleteTrip = async (id: number): Promise<void> => {
        await $fetch(`/api/trips/${id}`, {
            method: 'DELETE'
        })
    }

    const getTripStats = async (startDate?: string, endDate?: string): Promise<TripStats> => {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        const query = params.toString()
        return await $fetch<TripStats>(`/api/trips/stats${query ? `?${query}` : ''}`)
    }

    return {
        calculateCO2,
        getTransportModeLabel,
        getTransportModes,
        createTrip,
        getTrips,
        deleteTrip,
        getTripStats,
        CO2_EMISSION_FACTORS
    }
}

