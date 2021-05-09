import pg from 'pg'
import { v4 as uuidv4 } from 'uuid';

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

const getItems = (request, response) => {
  pool.query('SELECT * FROM items2', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createItem = (request, response) => {
  const id = uuidv4();
  const { name } = request.body

  pool.query('INSERT INTO items2 (name, id) VALUES ($1, $2)', [name, id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Item added with name: ${name}`)
  })
}

const deleteItem = (request, response) => {
  const { id } = request.params

  pool.query('DELETE FROM items2 WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Item deleted with ID: ${id}`)
  })
}

export default {
  getUsers,
  getItems,
  createItem,
  deleteItem
}