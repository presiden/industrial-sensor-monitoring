export default defineEventHandler(async (event) => {
  // Accept both POST and PUT methods
  if (!['POST', 'PUT'].includes(event.method)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  }

  const db = useDatabase()
  const id = parseInt(getRouterParam(event, 'id') || '0', 10)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sensor ID',
    })
  }

  try {
    const body = await readBody(event)

    const updates = {
      manufacturer: body.manufacturer,
      model: body.model,
      serial_number: body.serial_number,
      min_value: body.min_value,
      max_value: body.max_value,
      accuracy: body.accuracy,
      resolution: body.resolution,
      calibration_date: body.calibration_date,
      calibration_due: body.calibration_due,
      installation_date: body.installation_date
    }

    const result = await db.query(
      `UPDATE sensor_spec 
       SET manufacturer = $2,
           model = $3,
           serial_number = $4,
           min_value = $5,
           max_value = $6,
           accuracy = $7,
           resolution = $8,
           calibration_date = $9,
           calibration_due = $10,
           installation_date = $11,
           updated_at = now()
       WHERE sensor_id = $1
       RETURNING *`,
      [
        id,
        updates.manufacturer,
        updates.model,
        updates.serial_number,
        updates.min_value,
        updates.max_value,
        updates.accuracy,
        updates.resolution,
        updates.calibration_date,
        updates.calibration_due,
        updates.installation_date
      ]
    )

    if (!result.rows || result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor spec not found',
      })
    }

    return result.rows[0]
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 400) throw error
    console.error('Error updating sensor spec:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update sensor spec',
    })
  }
})
