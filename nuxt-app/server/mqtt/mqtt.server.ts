import mqtt from 'mqtt'
import { Pool } from 'pg'

export default defineNitroPlugin(() => {
  const client = mqtt.connect('mqtt://mqtt:1883')

  const pool = new Pool({
    host: 'db',
    user: 'sensor',
    password: 'sensor',
    database: 'sensor_db'
  })

  client.on('connect', () => {
    client.subscribe('factory/sensor/+')
  })

  client.on('message', async (topic, payload) => {
    const code = topic.split('/').pop()
    const data = JSON.parse(payload.toString())

    await pool.query(`
      INSERT INTO sensor_measurement(time,sensor_id,value,quality)
      SELECT now(), id, $1, $2 FROM sensor WHERE sensor_code=$3
    `, [data.value, data.quality ?? 100, code])
  })
})