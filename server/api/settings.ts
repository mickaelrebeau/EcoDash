import db from '../utils/db'

export default defineEventHandler(async (event) => {
    const method = event.method

    // GET - Retrieve settings
    if (method === 'GET') {
        const settings = db.prepare('SELECT key, value FROM settings').all()
        const result: Record<string, any> = {}

        for (const s of settings as any[]) {
            // Try to parse as number or boolean
            let value: any = s.value
            if (value === 'true') value = true
            else if (value === 'false') value = false
            else if (!isNaN(Number(value))) value = Number(value)

            result[s.key] = value
        }

        return {
            success: true,
            data: result
        }
    }

    // PUT - Update settings
    if (method === 'PUT') {
        const body = await readBody(event)

        const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `)

        for (const [key, value] of Object.entries(body)) {
            const strValue = String(value)
            upsert.run(key, strValue, strValue)
        }

        return {
            success: true,
            message: 'Settings updated'
        }
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
