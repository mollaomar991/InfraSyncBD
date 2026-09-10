import express from 'express';
import multer from 'multer';
import { submitProgress, getProgress } from '../controllers/progressController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup multer for simple photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save files to 'uploads' folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
router.post('/submit', authMiddleware, upload.single('photo'), submitProgress);
router.get('/:projectId', authMiddleware, getProgress);

export default router;
