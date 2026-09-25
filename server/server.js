import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import inspectionRoutes from './src/routes/inspectionRoutes.js';
import complaintRoutes from './src/routes/complaintRoutes.js';
import restorationRoutes from './src/routes/restorationRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import conflictRoutes from './src/routes/conflictRoutes.js';
import coordinationRoutes from './src/routes/coordinationRoutes.js';
import approvalRoutes from './src/routes/approvalRoutes.js';
import contractorRoutes from './src/routes/contractorRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import { ensureAiSchema } from './src/services/aiSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/restorations', restorationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/coordination', coordinationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/ai', aiRoutes);
// Public departments route for registration form
app.use('/api/departments', async (req, res) => {
    try {
        const pool = (await import('./src/config/db.js')).default;
        const [rows] = await pool.query('SELECT * FROM departments WHERE status = "active"');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await ensureAiSchema();
        console.log('AI estimate storage ready.');
    } catch (error) {
        console.warn('AI estimate table could not be prepared yet:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
