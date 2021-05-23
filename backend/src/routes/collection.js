import { Router } from 'express';
import db from '../queries';

const multer = require("multer");
const upload = multer();
const imageUpload = multer({ dest: 'temp/' });

const router = Router();

router.get('/', db.getItems)

router.post('/addtext', upload.array(), db.createItem)

router.post('/addimage', imageUpload.single('image'), db.createImage)

router.delete('/delete?:id', db.deleteItem)

export default router;