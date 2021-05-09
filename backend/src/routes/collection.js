import { Router } from 'express';
import db from '../queries'

const router = Router();

router.get('/', db.getItems)

router.post('/new', db.createItem)

router.delete('/delete/:id', db.deleteItem)

export default router;