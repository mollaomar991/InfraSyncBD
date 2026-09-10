import express from 'express';
import { getConflicts, resolveConflict } from '../controllers/conflictController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getConflicts);
router.put('/:id/resolve', authMiddleware, resolveConflict);

export default router;
