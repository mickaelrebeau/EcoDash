import db from '../utils/db'

export default defineEventHandler(async (event) => {
    const method = event.method
    const query = getQuery(event)

    // GET - Retrieve readings
    if (method === 'GET') {
        const { from, to, type, limit, aggregation } = query

        let sql = 'SELECT * FROM readings WHERE 1=1'
        const params: any[] = []

        if (from) {
            sql += ' AND timestamp >= ?'
            params.push(from)
        }

        if (to) {
            sql += ' AND timestamp <= ?'
            params.push(to)
        }

        if (type) {
            sql += ' AND type = ?'
            params.push(type)
        }

        sql += ' ORDER BY timestamp DESC'

        if (limit) {
            sql += ' LIMIT ?'
            params.push(parseInt(limit as string))
        }

        const readings = db.prepare(sql).all(...params)

        // Calculate aggregations
        const totalKwh = readings.reduce((sum: number, r: any) => sum + r.value, 0)

        return {
            success: true,
            data: readings,
            meta: {
                count: readings.length,
                totalKwh: Number(totalKwh.toFixed(2)),
                from: readings[readings.length - 1]?.timestamp,
                to: readings[0]?.timestamp
            }
        }
    }

    // POST - Add new reading(s)
    if (method === 'POST') {
        const body = await readBody(event)

        const insert = db.prepare(`
      INSERT INTO readings (timestamp, type, value, unit, source)
      VALUES (?, ?, ?, ?, ?)
    `)

        // Handle single or bulk insert
        const readings = Array.isArray(body) ? body : [body]
        const insertMany = db.transaction((items: any[]) => {
            for (const item of items) {
                insert.run(
                    item.timestamp || new Date().toISOString(),
                    item.type || 'electricity',
                    item.value,
                    item.unit || 'kWh',
                    item.source || 'manual'
                )
            }
        })

        insertMany(readings)

        return {
            success: true,
            message: `${readings.length} reading(s) added`,
            count: readings.length
        }
    }

    // DELETE - Remove readings
    if (method === 'DELETE') {
        const { id, before } = query

        if (id) {
            db.prepare('DELETE FROM readings WHERE id = ?').run(id)
            return { success: true, message: 'Reading deleted' }
        }

        if (before) {
            const result = db.prepare('DELETE FROM readings WHERE timestamp < ?').run(before)
            return { success: true, message: `${result.changes} readings deleted` }
        }

        throw createError({ statusCode: 400, message: 'Specify id or before parameter' })
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
