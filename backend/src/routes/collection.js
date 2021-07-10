import { Router } from 'express';
import db from '../queries';

const multer = require("multer");
const upload = multer();
const imageUpload = multer({ dest: 'temp/' });

const router = Router();

router.get('/', db.getItems)

router.get('/update', db.getItemUpdate)

router.get('/tags', db.getTags)

router.post('/addtag', upload.array(), db.createTag)

router.post('/addtext', upload.array(), db.createItem)

router.post('/addimage', imageUpload.single('image'), db.createImage)

router.post('/addlink', upload.array(), db.saveLink)

router.post('/getscreenshot', db.getScreenshot)

router.delete('/delete?:id', db.deleteItem)

export default router;