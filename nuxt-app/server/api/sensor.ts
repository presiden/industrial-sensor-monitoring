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
        ROUND(AVG(m.value)::numeric, 2)::float as current_value,
        MAX(m.time) as last_updated
      FROM sensor s
      LEFT JOIN sensor_measurement m ON s.id = m.sensor_id AND m.time > now() - INTERVAL '1 hour'
      GROUP BY s.id, s.sensor_code, s.sensor_type, s.unit, s.location, s.status
      ORDER BY s.created_at
    `)
    
    return sensors
  } catch (error) {
    console.error('Error fetching sensors:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sensors',
    })
  }
})
