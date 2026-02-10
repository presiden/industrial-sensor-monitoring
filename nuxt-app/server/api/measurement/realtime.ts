export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const sensorId = getQuery(event).sensor_id
  
  if (!sensorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'sensor_id query parameter is required',
    })
  }

  try {
    const measurements = await db.query(`
      SELECT 
        time, value, quality, status
      FROM sensor_measurement
      WHERE sensor_id = $1 AND time > now() - INTERVAL '1 hour'
      ORDER BY time DESC
      LIMIT 100
    `, [sensorId])

    return measurements
  } catch (error) {
    console.error('Error fetching measurements:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch measurements',
    })
  }
})
