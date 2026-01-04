import db from '../utils/db'

export default defineEventHandler(async (event) => {
    const method = event.method

    // GET - Retrieve alerts
    if (method === 'GET') {
        const query = getQuery(event)
        const { status, severity, limit } = query

        let sql = 'SELECT * FROM alerts WHERE 1=1'
        const params: any[] = []

        if (status === 'active') {
            sql += ' AND acknowledged = 0'
        } else if (status === 'acknowledged') {
            sql += ' AND acknowledged = 1'
        }

        if (severity) {
            sql += ' AND severity = ?'
            params.push(severity)
        }

        sql += ' ORDER BY created_at DESC'

        if (limit) {
            sql += ' LIMIT ?'
            params.push(parseInt(limit as string))
        }

        const alerts = db.prepare(sql).all(...params)
        const unacknowledged = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0').get() as any

        return {
            success: true,
            data: alerts.map((a: any) => ({
                ...a,
                context: a.context ? JSON.parse(a.context) : null,
                acknowledged: !!a.acknowledged
            })),
            meta: {
                total: alerts.length,
                unacknowledged: unacknowledged.count
            }
        }
    }

    // POST - Create alert
    if (method === 'POST') {
        const body = await readBody(event)

        const result = db.prepare(`
      INSERT INTO alerts (type, severity, message, context)
      VALUES (?, ?, ?, ?)
    `).run(
            body.type || 'threshold',
            body.severity || 'info',
            body.message,
            body.context ? JSON.stringify(body.context) : null
        )

        return {
            success: true,
            data: {
                id: result.lastInsertRowid,
                ...body,
                acknowledged: false,
                created_at: new Date().toISOString()
            }
        }
    }

    // PATCH - Acknowledge alert(s)
    if (method === 'PATCH') {
        const body = await readBody(event)

        if (body.acknowledgeAll) {
            db.prepare('UPDATE alerts SET acknowledged = 1').run()
            return { success: true, message: 'All alerts acknowledged' }
        }

        if (body.id) {
            db.prepare('UPDATE alerts SET acknowledged = 1 WHERE id = ?').run(body.id)
            return { success: true, message: 'Alert acknowledged' }
        }

        throw createError({ statusCode: 400, message: 'Specify id or acknowledgeAll' })
    }

    // DELETE - Clear alerts
    if (method === 'DELETE') {
        const query = getQuery(event)

        if (query.id) {
            db.prepare('DELETE FROM alerts WHERE id = ?').run(query.id)
            return { success: true, message: 'Alert deleted' }
        }

        if (query.all === 'true') {
            db.prepare('DELETE FROM alerts').run()
            return { success: true, message: 'All alerts cleared' }
        }

        // Delete acknowledged alerts older than 7 days
        db.prepare(`DELETE FROM alerts WHERE acknowledged = 1 AND created_at < datetime('now', '-7 days')`).run()
        return { success: true, message: 'Old acknowledged alerts cleared' }
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
