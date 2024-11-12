import { Router } from 'express';
import { shareNote } from '../controllers/emailController.js';
import {checkAuth} from '../middlewares/checkAuth.js';

const router = Router();

router.post('/', checkAuth, shareNote);

export default router;