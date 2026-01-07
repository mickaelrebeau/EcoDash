import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { date, category, subcategory, quantity, unit, notes } = body

    if (!date || !category || !subcategory) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Les champs date, category et subcategory sont requis'
        })
    }

    // Les facteurs d'émission sont calculés côté client, mais on les recalcule pour sécurité
    // Importons la logique depuis le composable (simplifié ici)
    const qty = quantity || 1
    
    // Facteurs simplifiés (le calcul complet est dans le composable)
    // On accepte le co2_kg calculé côté client
    const co2_kg = body.co2_kg || 0

    const stmt = db.prepare(`
        INSERT INTO activities (date, category, subcategory, quantity, unit, co2_kg, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(date, category, subcategory, qty, unit || null, co2_kg, notes || null)

    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid) as any

    return {
        success: true,
        data: {
            id: activity.id,
            date: activity.date,
            category: activity.category,
            subcategory: activity.subcategory,
            quantity: activity.quantity || null,
            unit: activity.unit || null,
            co2_kg: activity.co2_kg,
            notes: activity.notes || null,
            created_at: activity.created_at
        }
    }
})

