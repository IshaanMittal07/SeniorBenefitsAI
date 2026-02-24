import express from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);

export default router;
