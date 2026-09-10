import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.post('/mark-all-read', authMiddleware, markAllAsRead);
router.post('/:id/read', authMiddleware, markAsRead);

export default router;
