import express from 'express';
import { getInspections, scheduleInspection } from '../controllers/inspectionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getInspections);
router.post('/schedule', authMiddleware, scheduleInspection);

export default router;
