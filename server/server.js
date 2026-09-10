import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

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

const app = express();

app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
