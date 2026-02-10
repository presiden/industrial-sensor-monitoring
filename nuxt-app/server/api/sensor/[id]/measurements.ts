export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const id = parseInt(getRouterParam(event, 'id') || '0', 10)
  const range = (getQuery(event).range as string) || '1h'

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sensor ID',
    })
  }

  try {
    let query = ''
    
    switch (range) {
      case '6h':
        query = `SELECT time, value, quality, status
                 FROM sensor_measurement
                 WHERE sensor_id = $1 AND time > now() - INTERVAL '6 hours'
                 ORDER BY time ASC`
        break
      case '24h':
        query = `SELECT time, value, quality, status
                 FROM sensor_measurement
                 WHERE sensor_id = $1 AND time > now() - INTERVAL '24 hours'
                 ORDER BY time ASC`
        break
      case '7d':
        query = `SELECT time, value, quality, status
                 FROM sensor_measurement
                 WHERE sensor_id = $1 AND time > now() - INTERVAL '7 days'
                 ORDER BY time ASC`
        break
      default:
        query = `SELECT time, value, quality, status
                 FROM sensor_measurement
                 WHERE sensor_id = $1 AND time > now() - INTERVAL '1 hour'
                 ORDER BY time ASC`
    }

    const result = await db.query(query, [id])

    return result.rows || []
  } catch (error: any) {
    console.error('Error fetching measurements:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch measurements'
    })
  }
})
