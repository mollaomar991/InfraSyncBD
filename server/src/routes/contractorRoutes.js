import express from 'express';
import { getVerifiedContractors, assignContractor } from '../controllers/contractorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/verified', authMiddleware, getVerifiedContractors);
router.post('/assign', authMiddleware, assignContractor);

export default router;
