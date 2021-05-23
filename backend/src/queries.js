import pg from 'pg'
import { v4 as uuidv4 } from 'uuid';

const aws = require("aws-sdk");
const s3 = new aws.S3();

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
    results.rows.forEach(item => {
      if (item.image) {
        item.url = process.env.CFURL + item.id
      }
    })
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

const createImage = (request, response) => {
  const { name } = request.body

  const id = uuidv4();
  const fs = require('fs');
  const fileContent = fs.createReadStream(request.file.path);

  fileContent.on('error', function (err) {
    console.log('File Error', err);
  });

  const path = require('path');
  const fileName = path.basename(request.file.originalname);
  const params = {
    Bucket: process.env.BUCKETNAME,
    Key: id, // File name you want to save as in S3
    Body: fileContent,
    ContentType: request.file.mimetype
  };

  const image = fileName

  s3.upload(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
      pool.query('INSERT INTO items2 (name, id, image) VALUES ($1, $2, $3)', [name, id, image], (error, results) => {
        if (error) {
          throw error
        }
        response.status(201).send(`Item added with name: ${name}`)
      })
    }
  });
}

const deleteItem = (request, response) => {
  const { id, type } = request.query
  if (type === 'image') {
    const params = {
      Bucket: process.env.BUCKETNAME,
      Key: id,
    };

    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);  // error
      else console.log("deleted", data);                 // deleted
    });
  }

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
  createImage,
  deleteItem
}