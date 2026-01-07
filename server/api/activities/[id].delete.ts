import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID de l\'activité requis'
        })
    }

    const stmt = db.prepare('DELETE FROM activities WHERE id = ?')
    const result = stmt.run(parseInt(id))

    if (result.changes === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Activité non trouvée'
        })
    }

    return {
        success: true,
        message: 'Activité supprimée avec succès'
    }
})

