import express from 'express';
import { getCoordinationRequests, createCoordinationRequest, respondToCoordination } from '../controllers/coordinationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCoordinationRequests);
router.post('/request', authMiddleware, createCoordinationRequest);
router.put('/:id/respond', authMiddleware, respondToCoordination);

export default router;
