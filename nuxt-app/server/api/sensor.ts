export default defineEventHandler(async (event) => {
  const db = useDatabase()
  
  try {
    const sensors = await db.query(`
      SELECT 
        s.id,
        s.sensor_code,
        s.sensor_type,
        s.unit,
        s.location,
        s.status,
        (SELECT value FROM sensor_measurement WHERE sensor_id = s.id ORDER BY time DESC LIMIT 1) as current_value,
        (SELECT time FROM sensor_measurement WHERE sensor_id = s.id ORDER BY time DESC LIMIT 1) as last_updated
      FROM sensor s
      ORDER BY s.created_at
    `)
    
    return sensors.rows || []
  } catch (error) {
    console.error('Error fetching sensors:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sensors',
    })
  }
})
