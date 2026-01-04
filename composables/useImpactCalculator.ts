// Facteurs de conversion écologiques
const CO2_PER_KWH = 0.0569 // kg CO₂/kWh (France - mix énergétique)
const KM_PER_KG_CO2 = 6.5   // km voiture/kg CO₂
const TREE_ABSORPTION = 22  // kg CO₂/arbre/an

export interface ImpactSummary {
    kwh: number
    co2Kg: number
    kmEquivalent: number
    treesNeeded: number
    comparisonPercent: number
    status: 'better' | 'average' | 'worse'
}

export const useImpactCalculator = () => {
    // Moyenne nationale française (kWh/mois pour un foyer)
    const NATIONAL_AVERAGE_MONTHLY = 390

    const kwhToCO2 = (kwh: number): number => {
        return Number((kwh * CO2_PER_KWH).toFixed(2))
    }

    const co2ToKm = (co2Kg: number): number => {
        return Number((co2Kg * KM_PER_KG_CO2).toFixed(1))
    }

    const co2ToTrees = (co2Kg: number): number => {
        return Number((co2Kg / TREE_ABSORPTION).toFixed(2))
    }

    const getImpactSummary = (kwh: number): ImpactSummary => {
        const co2 = kwhToCO2(kwh)
        const comparisonPercent = Number((((kwh - NATIONAL_AVERAGE_MONTHLY) / NATIONAL_AVERAGE_MONTHLY) * 100).toFixed(1))

        let status: 'better' | 'average' | 'worse'
        if (comparisonPercent < -10) {
            status = 'better'
        } else if (comparisonPercent > 10) {
            status = 'worse'
        } else {
            status = 'average'
        }

        return {
            kwh,
            co2Kg: co2,
            kmEquivalent: co2ToKm(co2),
            treesNeeded: co2ToTrees(co2),
            comparisonPercent,
            status
        }
    }

    const getEcoTips = (status: 'better' | 'average' | 'worse'): string[] => {
        const tips = {
            better: [
                "Excellent ! Continuez ainsi 🌱",
                "Votre consommation est exemplaire",
                "Partagez vos bonnes pratiques"
            ],
            average: [
                "Éteignez les appareils en veille",
                "Privilégiez les heures creuses",
                "Vérifiez l'isolation de votre logement"
            ],
            worse: [
                "⚠️ Consommation élevée détectée",
                "Identifiez les appareils énergivores",
                "Envisagez un audit énergétique",
                "Remplacez les ampoules par des LED"
            ]
        }
        return tips[status]
    }

    return {
        kwhToCO2,
        co2ToKm,
        co2ToTrees,
        getImpactSummary,
        getEcoTips,
        CO2_PER_KWH,
        NATIONAL_AVERAGE_MONTHLY
    }
}
