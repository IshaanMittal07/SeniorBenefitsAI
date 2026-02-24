import express from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, profileController.createProfile);
router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);

export default router;
