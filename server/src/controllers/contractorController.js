import pool from '../config/db.js';

// =============================================
// Contractor Assignment API - Module 4
// 2 Functions: GetVerified, AssignToProject
// =============================================

// --- 1. Get all verified contractors (GET /api/contractors/verified) ---
export const getVerifiedContractors = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT cp.*, u.full_name, u.email, u.phone
            FROM contractor_profiles cp
            LEFT JOIN users u ON cp.user_id = u.user_id
            WHERE u.account_status = 'active'
            ORDER BY cp.performance_rating DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 2. Assign contractor to a project (POST /api/contractors/assign) ---
export const assignContractor = async (req, res) => {
    const { projectId, contractorId } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update project: set contractor and change status
        await connection.query(
            `UPDATE projects SET assigned_contractor_id = ?, status = 'contractor_assigned' WHERE project_id = ? AND status = 'final_approved'`,
            [contractorId, projectId]
        );

        // Increase contractor's total assigned projects count
        await connection.query(
            `UPDATE contractor_profiles SET total_assigned_projects = total_assigned_projects + 1 WHERE contractor_id = ?`,
            [contractorId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Contractor assigned successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error assigning contractor:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
};
