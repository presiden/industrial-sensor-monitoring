import { Pool } from 'pg'

let pool: Pool | null = null

export const useDatabase = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sensor_db',
      user: process.env.DB_USER || 'sensor',
      password: process.env.DB_PASSWORD || 'sensor',
    })

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  return {
    query: async (text: string, values?: any[]) => {
      try {
        const res = await pool!.query(text, values)
        return {
          rows: res.rows,
          rowCount: res.rowCount,
          command: res.command
        }
      } catch (error) {
        console.error('Database query error:', error, { text, values })
        throw error
      }
    },
  }
}
