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

    sql += ' ORDER BY date DESC, created_at DESC'

    const activities = db.prepare(sql).all(...params) as any[]

    return {
        success: true,
        data: activities.map(activity => ({
            id: activity.id,
            date: activity.date,
            category: activity.category,
            subcategory: activity.subcategory,
            quantity: activity.quantity || null,
            unit: activity.unit || null,
            co2_kg: activity.co2_kg,
            notes: activity.notes || null,
            created_at: activity.created_at
        }))
    }
})

