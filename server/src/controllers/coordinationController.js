import pool from '../config/db.js';

// =============================================
// Coordination API - Module 3
// 3 Functions: GetAll, Create, Respond
// =============================================

// --- 1. Get all coordination requests (GET /api/coordination) ---
export const getCoordinationRequests = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT cr.*,
                   p.project_name,
                   sd.department_name AS sender_department,
                   rd.department_name AS receiver_department
            FROM coordination_requests cr
            LEFT JOIN projects p ON cr.project_id = p.project_id
            LEFT JOIN departments sd ON cr.sender_department_id = sd.department_id
            LEFT JOIN departments rd ON cr.receiver_department_id = rd.department_id
            ORDER BY cr.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching coordination requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 2. Create a coordination request (POST /api/coordination/request) ---
export const createCoordinationRequest = async (req, res) => {
    try {
        const { projectId, receiverDepartmentId, suggestedStartDate, suggestedEndDate, notes } = req.body;

        // Find the sender's department from their officer profile
        const [officer] = await pool.query(
            'SELECT department_id FROM officer_profiles WHERE user_id = ?',
            [req.user.userId]
        );

        if (officer.length === 0) {
            return res.status(403).json({ success: false, message: 'Officer profile not found' });
        }

        const senderDepartmentId = officer[0].department_id;

        const [result] = await pool.query(
            `INSERT INTO coordination_requests (project_id, sender_department_id, receiver_department_id, suggested_start_date, suggested_end_date, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [projectId, senderDepartmentId, receiverDepartmentId, suggestedStartDate, suggestedEndDate, notes]
        );

        res.status(201).json({ success: true, message: 'Coordination request sent', coordinationId: result.insertId });
    } catch (error) {
        console.error('Error creating coordination request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 3. Respond to a coordination request (PUT /api/coordination/:id/respond) ---
export const respondToCoordination = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // status can be: 'accepted', 'changes_requested', 'rejected'
        await pool.query(
            `UPDATE coordination_requests SET status = ?, notes = ? WHERE coordination_id = ?`,
            [status, notes, id]
        );

        // Fetch the project_id associated with this request
        const [coordRequest] = await pool.query(
            `SELECT project_id FROM coordination_requests WHERE coordination_id = ?`,
            [id]
        );
        const projectId = coordRequest[0].project_id;

        if (status === 'changes_requested' || status === 'rejected') {
            // Update project status to rework_required
            await pool.query(
                `UPDATE projects SET status = 'rework_required' WHERE project_id = ?`,
                [projectId]
            );
        } else if (status === 'accepted') {
            // Check if ALL coordination requests for this project are now accepted
            const [counts] = await pool.query(
                `SELECT 
                    COUNT(*) as total_requests,
                    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_requests
                 FROM coordination_requests WHERE project_id = ?`,
                [projectId]
            );

            if (Number(counts[0].total_requests) > 0 && Number(counts[0].accepted_requests) === Number(counts[0].total_requests)) {
                // All coordination requests are accepted!
                // Move project to 'under_approval'
                await pool.query(
                    `UPDATE projects SET status = 'under_approval' WHERE project_id = ?`,
                    [projectId]
                );

                // Auto-create approval requests for all required departments (the receivers of coordination requests)
                const [departments] = await pool.query(
                    `SELECT DISTINCT receiver_department_id FROM coordination_requests WHERE project_id = ?`,
                    [projectId]
                );

                for (const dept of departments) {
                    // Avoid inserting duplicates
                    await pool.query(
                        `INSERT IGNORE INTO approval_requests (project_id, approving_department_id, decision)
                         VALUES (?, ?, 'pending')`,
                        [projectId, dept.receiver_department_id]
                    );
                }
            }
        }

        res.json({ success: true, message: `Coordination request ${status}` });
    } catch (error) {
        console.error('Error responding to coordination:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
