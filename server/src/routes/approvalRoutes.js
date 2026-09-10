import express from 'express';
import { getApprovals, requestApproval, voteOnApproval } from '../controllers/approvalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getApprovals);
router.post('/request', authMiddleware, requestApproval);
router.post('/:id/vote', authMiddleware, voteOnApproval);

export default router;
