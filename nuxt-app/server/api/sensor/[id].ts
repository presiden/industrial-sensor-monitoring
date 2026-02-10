export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const id = getRouterParam(event, 'id')

  try {
    const sensor = await db.query(`
      SELECT 
        id, sensor_code, sensor_type, unit, location, status, created_at
      FROM sensor
      WHERE id = $1
    `, [id])

    if (!sensor || sensor.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor not found',
      })
    }

    return sensor[0]
  } catch (error) {
    if (error.statusCode === 404) throw error
    console.error('Error fetching sensor:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sensor',
    })
  }
})
