export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const id = getRouterParam(event, 'id')

  try {
    const spec = await db.query(`
      SELECT 
        manufacturer, model, serial_number, 
        min_value, max_value, accuracy, resolution,
        installation_date, calibration_date, calibration_due
      FROM sensor_spec
      WHERE sensor_id = $1
    `, [id])

    if (!spec || spec.length === 0) {
      return null
    }

    return spec[0]
  } catch (error) {
    console.error('Error fetching sensor spec:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sensor specification',
    })
  }
})
