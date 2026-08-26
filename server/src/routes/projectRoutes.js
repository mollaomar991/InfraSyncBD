import express from 'express';
import { 
    createProject, 
    getProjects, 
    getProjectById, 
    updateProject, 
    deleteProject 
} from '../controllers/projectController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// =============================================
// Task 2: Project Routes - Module 2
// =============================================

// All routes here will require the user to be logged in (authMiddleware)
router.use(authMiddleware);

// --- 1. Create a project ---
// Only 'department_officer' can create a project
router.post('/', requireRole(['department_officer']), createProject);

// --- 2. View all projects ---
// Any logged-in user can view projects
router.get('/', getProjects);

// --- 3. View a specific project ---
// Any logged-in user can view project details
router.get('/:id', getProjectById);

// --- 4. Update a project ---
// Only 'department_officer' can update their project
router.put('/:id', requireRole(['department_officer']), updateProject);

// --- 5. Delete a project ---
// Only 'department_officer' can delete their draft project
router.delete('/:id', requireRole(['department_officer']), deleteProject);

export default router;
