export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const kwh = parseFloat(query.kwh as string) || 0

    // Conversion factors
    const CO2_PER_KWH = 0.0569 // kg CO2/kWh (French energy mix)
    const KM_PER_KG_CO2 = 6.5
    const TREE_ABSORPTION = 22 // kg CO2/year
    const NATIONAL_AVERAGE = 390 // kWh/month

    const co2Kg = kwh * CO2_PER_KWH
    const kmEquivalent = co2Kg * KM_PER_KG_CO2
    const treesNeeded = co2Kg / TREE_ABSORPTION
    const comparisonPercent = ((kwh - NATIONAL_AVERAGE) / NATIONAL_AVERAGE) * 100

    let status: 'better' | 'average' | 'worse'
    if (comparisonPercent < -10) status = 'better'
    else if (comparisonPercent > 10) status = 'worse'
    else status = 'average'

    return {
        success: true,
        data: {
            input: {
                kwh,
                period: 'month'
            },
            impact: {
                co2Kg: Number(co2Kg.toFixed(2)),
                kmEquivalent: Number(kmEquivalent.toFixed(1)),
                treesNeeded: Number(treesNeeded.toFixed(2))
            },
            comparison: {
                nationalAverage: NATIONAL_AVERAGE,
                percentDiff: Number(comparisonPercent.toFixed(1)),
                status
            }
        }
    }
})
