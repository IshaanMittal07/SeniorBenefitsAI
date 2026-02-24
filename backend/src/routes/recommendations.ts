import express from 'express';
import * as recommendationController from '../controllers/recommendationController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, recommendationController.getRecommendations);
router.get('/benefits', optionalAuthMiddleware, recommendationController.listBenefits);
router.get('/benefits/:benefitId', authMiddleware, recommendationController.getBenefitDetails);
router.post('/natural-language', optionalAuthMiddleware, recommendationController.naturalLanguageRecommendation);

export default router;
