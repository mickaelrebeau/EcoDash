import db from '../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const period = query.period as string || 'day' // hour, day, week, month
    const type = query.type as string || 'electricity'
    const days = parseInt(query.days as string) || 30

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    let groupBy: string
    let dateFormat: string

    switch (period) {
        case 'hour':
            groupBy = "strftime('%Y-%m-%d %H:00', timestamp)"
            dateFormat = '%Y-%m-%d %H:00'
            break
        case 'week':
            groupBy = "strftime('%Y-W%W', timestamp)"
            dateFormat = '%Y-W%W'
            break
        case 'month':
            groupBy = "strftime('%Y-%m', timestamp)"
            dateFormat = '%Y-%m'
            break
        default: // day
            groupBy = "strftime('%Y-%m-%d', timestamp)"
            dateFormat = '%Y-%m-%d'
    }

    const sql = `
    SELECT 
      ${groupBy} as period,
      SUM(value) as total,
      AVG(value) as average,
      MAX(value) as peak,
      MIN(value) as minimum,
      COUNT(*) as readings_count
    FROM readings
    WHERE type = ?
      AND timestamp >= ?
    GROUP BY ${groupBy}
    ORDER BY period ASC
  `

    const data = db.prepare(sql).all(type, fromDate.toISOString())

    // Calculate totals
    const totals = db.prepare(`
    SELECT 
      SUM(value) as total,
      AVG(value) as average,
      MAX(value) as peak,
      COUNT(*) as count
    FROM readings
    WHERE type = ?
      AND timestamp >= ?
  `).get(type, fromDate.toISOString()) as any

    // Get comparison with previous period
    const previousFrom = new Date(fromDate)
    previousFrom.setDate(previousFrom.getDate() - days)

    const previousTotal = db.prepare(`
    SELECT SUM(value) as total
    FROM readings
    WHERE type = ?
      AND timestamp >= ?
      AND timestamp < ?
  `).get(type, previousFrom.toISOString(), fromDate.toISOString()) as any

    const trend = previousTotal?.total
        ? ((totals.total - previousTotal.total) / previousTotal.total * 100)
        : 0

    return {
        success: true,
        data: data.map((d: any) => ({
            period: d.period,
            total: Number(d.total.toFixed(2)),
            average: Number(d.average.toFixed(3)),
            peak: Number(d.peak.toFixed(2)),
            minimum: Number(d.minimum.toFixed(2)),
            count: d.readings_count
        })),
        summary: {
            totalKwh: Number((totals.total || 0).toFixed(2)),
            averageKwh: Number((totals.average || 0).toFixed(3)),
            peakKw: Number((totals.peak || 0).toFixed(2)),
            readingsCount: totals.count,
            trendPercent: Number(trend.toFixed(1)),
            periodDays: days
        }
    }
})
