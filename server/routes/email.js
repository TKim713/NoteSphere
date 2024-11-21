import { Router } from 'express';
import { shareNote, verifyEmail } from '../controllers/emailController.js';
import {checkAuth} from '../middlewares/checkAuth.js';

const router = Router();

router.get('/verify-email', verifyEmail);
router.post('/share', checkAuth, shareNote);

export default router;