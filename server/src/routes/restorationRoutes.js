import express from 'express';
import multer from 'multer';
import { submitRestoration, verifyRestoration } from '../controllers/restorationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/submit', authMiddleware, upload.fields([{ name: 'beforePhoto', maxCount: 1 }, { name: 'afterPhoto', maxCount: 1 }]), submitRestoration);
router.post('/:id/verify', authMiddleware, verifyRestoration);

export default router;
