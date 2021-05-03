import { Router } from 'express';
import db from '../queries'

const router = Router();

router.get('/', db.getUsers)

export default router;