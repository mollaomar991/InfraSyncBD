import express from 'express';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import { estimateBudget, estimateMaterials, getAiMetadata, getProjectAiEstimates } from '../controllers/aiController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/metadata', requireRole(['department_officer', 'contractor']), getAiMetadata);
router.post('/budget-estimate', requireRole(['department_officer']), estimateBudget);
router.post('/material-estimate', requireRole(['department_officer', 'contractor']), estimateMaterials);
router.get('/project/:projectId', requireRole(['department_officer', 'contractor']), getProjectAiEstimates);

export default router;
