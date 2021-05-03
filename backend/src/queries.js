import pg from 'pg'

const Pool = pg.Pool

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
})

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY email ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

export default {
  getUsers,
}