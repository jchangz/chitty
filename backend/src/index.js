import express from 'express';
import cors from 'cors';
import routes from './routes';
import 'dotenv/config';

const app = express();

const multer = require("multer");
const upload = multer();
app.use(upload.array());

app.use((req, res, next) => {
  next();
});

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use('/users', routes.user);
app.use('/collection', routes.collection);

app.listen(4000, () =>
  console.log('Listening on port 4000!'),
);