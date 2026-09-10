import pool from '../config/db.js';

// =============================================
// Approval Workflow API - Module 4
// 3 Functions: GetAll, RequestApproval, Vote
// =============================================

// --- 1. Get all approval requests (GET /api/approvals) ---
export const getApprovals = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ar.*,
                   p.project_name,
                   p.status AS project_status,
                   d.department_name AS approving_department
            FROM approval_requests ar
            LEFT JOIN projects p ON ar.project_id = p.project_id
            LEFT JOIN departments d ON ar.approving_department_id = d.department_id
            ORDER BY ar.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching approvals:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 2. Send approval request to departments (POST /api/approvals/request) ---
export const requestApproval = async (req, res) => {
    try {
        const { projectId, departmentIds } = req.body;

        // departmentIds is an array like [1, 2, 3]
        // Insert one approval_request row for each department
        for (const deptId of departmentIds) {
            await pool.query(
                `INSERT INTO approval_requests (project_id, approving_department_id, decision)
                 VALUES (?, ?, 'pending')`,
                [projectId, deptId]
            );
        }

        // Update project status to 'under_approval'
        await pool.query(
            `UPDATE projects SET status = 'under_approval' WHERE project_id = ?`,
            [projectId]
        );

        res.status(201).json({ success: true, message: 'Approval requests sent to departments' });
    } catch (error) {
        console.error('Error requesting approval:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 3. Vote on an approval (POST /api/approvals/:id/vote) ---
export const voteOnApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, comments } = req.body;

        // Find the officer_id of the logged-in user
        const [officer] = await pool.query(
            'SELECT officer_id FROM officer_profiles WHERE user_id = ?',
            [req.user.userId]
        );

        if (officer.length === 0) {
            return res.status(403).json({ success: false, message: 'Officer profile not found' });
        }

        // Update this approval request with the vote
        await pool.query(
            `UPDATE approval_requests SET decision = ?, comments = ?, reviewed_by_officer_id = ?, decision_date = NOW() WHERE approval_id = ?`,
            [decision, comments, officer[0].officer_id, id]
        );

        // Now check: did ALL departments approve this project?
        // First, find which project this approval belongs to
        const [thisApproval] = await pool.query(
            'SELECT project_id FROM approval_requests WHERE approval_id = ?',
            [id]
        );

        const projectId = thisApproval[0].project_id;

        // Count total approvals and pending ones for this project
        const [counts] = await pool.query(
            `SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN decision = 'approved' THEN 1 ELSE 0 END) AS approved_count
             FROM approval_requests WHERE project_id = ?`,
            [projectId]
        );

        // If all departments approved, update project status to 'final_approved'
        if (counts[0].total > 0 && counts[0].approved_count === counts[0].total) {
            await pool.query(
                `UPDATE projects SET status = 'final_approved' WHERE project_id = ?`,
                [projectId]
            );
        }

        res.json({ success: true, message: `Approval ${decision} recorded` });
    } catch (error) {
        console.error('Error voting on approval:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
