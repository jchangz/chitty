import { Router } from 'express';
import db from '../queries';

const multer = require("multer");
const upload = multer();
const router = Router();

router.get('/', db.getTags)

router.post('/editPost', upload.array(), db.editPostTag)

export default router;