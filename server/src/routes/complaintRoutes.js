import express from 'express';
import multer from 'multer';
import { submitComplaint, getComplaints, resolveComplaint } from '../controllers/complaintController.js';
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

router.post('/submit', authMiddleware, upload.single('photo'), submitComplaint);
router.get('/', authMiddleware, getComplaints);
router.post('/:id/resolve', authMiddleware, upload.single('photo'), resolveComplaint);

export default router;
