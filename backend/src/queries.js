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

const getItemUpdate = (request, response) => {
  const { id } = request.query
  pool.query(`
    SELECT id, i.name, i.image AS image, t.tags
    FROM items2 i
    LEFT JOIN (
      SELECT it.item_id AS id, json_agg(json_build_object('id', t.tag_id, 'name', t.name)) AS tags
      FROM tagmap it
      LEFT JOIN tag t ON t.tag_id = it.tag_id
      GROUP  BY it.item_id
    ) t USING (id) WHERE id = $1;`, [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getItems = (request, response) => {
  pool.query(`
    SELECT id, i.name, i.image AS image, t.tags
    FROM items2 i
    LEFT JOIN (
      SELECT it.item_id AS id, json_agg(json_build_object('id', t.tag_id, 'name', t.name)) AS tags
      FROM tagmap it
      LEFT JOIN tag t ON t.tag_id = it.tag_id
      GROUP  BY it.item_id
     ) t USING (id);`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createTag = (request, response) => {
  pool.query(`
    SELECT items2.*
    FROM tagmap, items2, tag
    WHERE tagmap.tag_id = tag.tag_id
      AND tag.name IN ('d')
      AND items2.id = tagmap.item_id`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getTags = (request, response) => {
  pool.query(`
    SELECT t.name, t.tag_id, COUNT(tm.tag_id) as count
    FROM tag t
    LEFT JOIN tagmap tm ON tm.tag_id = t.tag_id
    GROUP BY t.name, t.tag_id`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const editPostTag = (request, response) => {
  const { staged_tags, item_id } = request.body
  // const params = staged_tags.split(",").map(function (item, idx) { return "'" + item + "'" }).join(',')
  const tagParams = staged_tags.split(",").map(function (item, idx) { return "('" + item + "')" }).join(',')
  pool.query(`
    INSERT INTO tag (name) VALUES ${tagParams} ON CONFLICT (name) DO NOTHING;
    INSERT INTO tagmap (item_id, tag_id)
    SELECT '${item_id}', tz.tag_id
    FROM (
      SELECT t.name, t.tag_id
      FROM tag t
      WHERE t.name IN (${tagParams})
    ) tz`, (error, results) => {
    if (error) {
      throw error
    }
    console.log(pool.query)
    response.status(200).json(results.rows)
  })
}

const saveLink = async (request, response) => {
  const fetch = require('node-fetch');
  const id = uuidv4();
  const { url } = request.body

  // Call Fetch API
  const responseAPI = await fetch(process.env.FETCHAPI + url);
  const responseStatus = await responseAPI.status

  if (responseStatus !== 200) {
    // If fetch API timeout
    var imgTitle = url
  }
  else {
    const { title, image } = await responseAPI.json()
    var imgTitle = title

    // Get Image from Fetch
    if (image) {
      const imageURL = new URL(image, "https://example.com")
      try {
        const imageResponse = await fetch(imageURL)
        const img = await imageResponse
        if (img.ok) {
          const imgDate = Math.floor(Date.now() / 1000); // Get date to add to Key
          const params = {
            Bucket: process.env.BUCKETNAME,
            Key: (title || id) + imgDate, // Saved name in S3
            Body: img.body,
            ContentType: img.headers.get('content-type')
          }
          const s3upload = await s3.upload(params).promise()
          var imgKey = process.env.CFURL + encodeURI(params.Key) // File name in S3
        }
      } catch (error) {
        response.status(404).send(`Error: ${error}`)
      }
    }
  }

  // Save into DB
  pool.query('INSERT INTO items2 (name, id, image) VALUES ($1, $2, $3)', [imgTitle, id, imgKey], (error, results) => {
    if (error) {
      throw error
    }
    if (imgKey) {
      response.status(201).send(`Item added with name: ${imgTitle}`)
    } else {
      // Setup fetch for screenshot
      response.status(206).send({
        title: imgTitle,
        url: url,
        id: id
      })
    }
  })
}

const getScreenshot = async (request, response) => {
  const fetch = require('node-fetch');
  const { url, id, title } = request.body

  const responseAPI = await fetch(process.env.SCREENSHOTAPI + url)
  const body = await responseAPI.json()

  if (body) {
    const imgDate = Math.floor(Date.now() / 1000); // Get date to add to Key
    const params = {
      Bucket: process.env.BUCKETNAME,
      Key: (title || id) + imgDate, // Saved name in S3
      Body: Buffer.from(body, 'base64'),
      ContentType: 'image/jpeg'
    }
    const s3upload = await s3.upload(params).promise()
    var imgKey = process.env.CFURL + encodeURI(params.Key) // File name in S3
  }
  pool.query(`UPDATE items2 SET image = $1 WHERE id = $2`, [imgKey, id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Item added with name: ${title}`)
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
  saveLink,
  getScreenshot,
  createItem,
  createImage,
  deleteItem,
  getTags,
  createTag,
  editPostTag,
  getItemUpdate
}