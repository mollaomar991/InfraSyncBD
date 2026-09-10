import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboardAnalytics);

export default router;
