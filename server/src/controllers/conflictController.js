import pool from '../config/db.js';

// =============================================
// Conflict Detection API - Module 3
// 2 Functions: GetAll, Resolve
// =============================================

// --- 1. Get all conflict alerts (GET /api/conflicts) ---
export const getConflicts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ca.*,
                   p1.project_name AS project_name,
                   p2.project_name AS conflicting_project_name,
                   d1.department_name AS project_department,
                   d2.department_name AS conflicting_department
            FROM conflict_alerts ca
            LEFT JOIN projects p1 ON ca.project_id = p1.project_id
            LEFT JOIN projects p2 ON ca.conflicting_project_id = p2.project_id
            LEFT JOIN departments d1 ON p1.department_id = d1.department_id
            LEFT JOIN departments d2 ON p2.department_id = d2.department_id
            ORDER BY ca.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching conflicts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 2. Resolve a conflict (PUT /api/conflicts/:id/resolve) ---
export const resolveConflict = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE conflict_alerts SET resolution_status = 'resolved', resolved_at = NOW() WHERE conflict_id = ?`,
            [id]
        );

        res.json({ success: true, message: 'Conflict resolved successfully' });
    } catch (error) {
        console.error('Error resolving conflict:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
