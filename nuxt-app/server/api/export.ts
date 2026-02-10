export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = getQuery(event)
  const sensorId = query.sensor_id ? parseInt(query.sensor_id as string, 10) : null
  const range = (query.range as string) || '7d'
  const format = (query.format as string) || 'json'

  try {
    let sqlQuery = ''
    const params: any[] = []

    // Build query based on range
    let interval = '7 days'
    if (range === '1h') interval = '1 hour'
    if (range === '6h') interval = '6 hours'
    if (range === '24h') interval = '24 hours'

    if (sensorId) {
      sqlQuery = `
        SELECT 
          s.id,
          s.sensor_code,
          s.sensor_type,
          s.unit,
          s.location,
          m.time,
          m.value,
          m.quality,
          m.status
        FROM sensor s
        LEFT JOIN sensor_measurement m ON s.id = m.sensor_id
        WHERE s.id = $1 AND m.time > now() - INTERVAL '${interval}'
        ORDER BY m.time DESC
      `
      params.push(sensorId)
    } else {
      sqlQuery = `
        SELECT 
          s.id,
          s.sensor_code,
          s.sensor_type,
          s.unit,
          s.location,
          m.time,
          m.value,
          m.quality,
          m.status
        FROM sensor s
        LEFT JOIN sensor_measurement m ON s.id = m.sensor_id
        WHERE m.time > now() - INTERVAL '${interval}'
        ORDER BY s.id, m.time DESC
      `
    }

    const result = await db.query(sqlQuery, params)
    const data = result.rows || []

    if (format === 'csv') {
      const csv = exportToCSV(data)
      setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
      setHeader(event, 'Content-Disposition', 'attachment; filename="sensor_data.csv"')
      return csv
    } else if (format === 'excel') {
      return exportToExcel(data)
    } else {
      return data
    }
  } catch (error: any) {
    console.error('Error exporting data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to export data',
    })
  }
})

function exportToCSV(data: any[]): string {
  if (data.length === 0) return ''

  // Headers
  const headers = Object.keys(data[0])
  const csv = [headers.join(',')]

  // Rows
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    })
    csv.push(values.join(','))
  }

  return csv.join('\n')
}

function exportToExcel(data: any[]): any {
  // Return data structure for client-side processing with xlsx
  return {
    type: 'excel',
    data: data
  }
}
