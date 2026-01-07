import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const startDate = query.startDate as string | undefined
    const endDate = query.endDate as string | undefined

    let sql = 'SELECT * FROM activities WHERE 1=1'
    const params: any[] = []

    if (startDate) {
        sql += ' AND date >= ?'
        params.push(startDate)
    }

    if (endDate) {
        sql += ' AND date <= ?'
        params.push(endDate)
    }

    const activities = db.prepare(sql).all(...params) as any[]

    const totalActivities = activities.length
    const totalCO2 = activities.reduce((sum, activity) => sum + activity.co2_kg, 0)
    const averageCO2PerActivity = totalActivities > 0 ? totalCO2 / totalActivities : 0

    // Statistiques par catégorie
    const activitiesByCategory: Record<string, { count: number; co2: number }> = {}
    
    // Statistiques par sous-catégorie
    const activitiesBySubcategory: Record<string, { count: number; co2: number }> = {}
    
    activities.forEach(activity => {
        // Par catégorie
        if (!activitiesByCategory[activity.category]) {
            activitiesByCategory[activity.category] = {
                count: 0,
                co2: 0
            }
        }
        activitiesByCategory[activity.category].count++
        activitiesByCategory[activity.category].co2 += activity.co2_kg

        // Par sous-catégorie
        const subcatKey = `${activity.category}_${activity.subcategory}`
        if (!activitiesBySubcategory[subcatKey]) {
            activitiesBySubcategory[subcatKey] = {
                count: 0,
                co2: 0
            }
        }
        activitiesBySubcategory[subcatKey].count++
        activitiesBySubcategory[subcatKey].co2 += activity.co2_kg
    })

    return {
        success: true,
        data: {
            totalActivities,
            totalCO2: Number(totalCO2.toFixed(3)),
            averageCO2PerActivity: Number(averageCO2PerActivity.toFixed(3)),
            activitiesByCategory,
            activitiesBySubcategory
        }
    }
})

