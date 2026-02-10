export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const id = parseInt(getRouterParam(event, 'id') || '0', 10)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sensor ID',
    })
  }

  try {
    const sensorResult = await db.query(`
      SELECT 
        id, sensor_code, sensor_type, unit, location, status, created_at
      FROM sensor
      WHERE id = $1
    `, [id])

    if (!sensorResult.rows || sensorResult.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor not found',
      })
    }

    const sensor = sensorResult.rows[0]

    // Get sensor specification
    const specResult = await db.query(`
      SELECT *
      FROM sensor_spec
      WHERE sensor_id = $1
    `, [id])

    const spec = specResult.rows?.[0] || null

    // Get last 1 hour measurements
    const measurementsResult = await db.query(`
      SELECT time, value, quality, status
      FROM sensor_measurement
      WHERE sensor_id = $1 AND time > now() - INTERVAL '1 hour'
      ORDER BY time DESC
      LIMIT 100
    `, [id])

    const measurements = measurementsResult.rows || []

    return {
      ...sensor,
      spec,
      measurements,
      stats: {
        min: measurements.length > 0 ? Math.min(...measurements.map(m => m.value)) : null,
        max: measurements.length > 0 ? Math.max(...measurements.map(m => m.value)) : null,
        avg: measurements.length > 0 ? (measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length) : null,
        count: measurements.length
      }
    }
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 400) throw error
    console.error('Error fetching sensor:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sensor',
    })
  }
})
