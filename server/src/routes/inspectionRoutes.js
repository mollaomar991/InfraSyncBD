import express from 'express';
import { getInspections, scheduleInspection, saveInspectionResult } from '../controllers/inspectionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getInspections);
router.post('/schedule', authMiddleware, scheduleInspection);
router.post('/:id/save', authMiddleware, saveInspectionResult);

export default router;
