import express from 'express';
import { getPendingVerifications, verifyUser, getUsers, updateUserStatus } from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(['super_admin']));

router.get('/pending-verifications', getPendingVerifications);
router.put('/verify-user/:id', verifyUser);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;
