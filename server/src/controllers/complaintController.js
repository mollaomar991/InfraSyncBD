import pool from '../config/db.js';

export const submitComplaint = async (req, res) => {
    try {
        const { category, locationAddress, description, projectId } = req.body;
        
        let photoUrl = null;
        if (req.file) {
            photoUrl = req.file.filename;
        }

        const ticketNo = `CMP-${Date.now().toString().slice(-6)}`;
        
        // Ensure projectId is translated to the internal integer project_id
        let validProjectId = null;
        if (projectId && projectId !== 'null' && projectId !== 'undefined') {
            const [proj] = await pool.query('SELECT project_id FROM projects WHERE project_code = ? OR project_id = ? LIMIT 1', [projectId, projectId]);
            if (proj.length > 0) {
                validProjectId = proj[0].project_id;
            }
        }

        const [result] = await pool.query(
            `INSERT INTO complaints (complaint_ticket_no, citizen_user_id, project_id, category, location_address, description, evidence_photo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ticketNo, req.user.userId, validProjectId, category, locationAddress, description, photoUrl]
        );

        res.status(201).json({ success: true, message: 'Complaint submitted', ticketNo, complaintId: result.insertId });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getComplaints = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, u.full_name as citizen_name, cp.company_name as assigned_contractor_name
            FROM complaints c 
            LEFT JOIN users u ON c.citizen_user_id = u.user_id 
            LEFT JOIN contractor_profiles cp ON c.assigned_contractor_id = cp.contractor_id
            ORDER BY c.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const resolveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionSummary } = req.body;
        
        let photoUrl = null;
        if (req.file) {
            photoUrl = req.file.filename;
        }

        await pool.query(
            `UPDATE complaints SET status = 'resolved', resolution_summary = ?, resolution_photo_url = ?, resolved_at = NOW() WHERE complaint_id = ?`,
            [resolutionSummary, photoUrl, id]
        );

        res.json({ success: true, message: 'Complaint resolved' });
    } catch (error) {
        console.error('Error resolving complaint:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedContractorName } = req.body;
        
        let dbStatus = 'submitted';
        if (status === 'Assigned') dbStatus = 'assigned';
        else if (status === 'In Progress') dbStatus = 'in_progress';
        else if (status === 'Resolved') dbStatus = 'resolved';
        else if (status === 'Closed') dbStatus = 'closed';

        if (assignedContractorName) {
            const [contractorRows] = await pool.query('SELECT contractor_id FROM contractor_profiles WHERE company_name = ?', [assignedContractorName]);
            if (contractorRows.length > 0) {
                await pool.query(
                    `UPDATE complaints SET status = ?, assigned_contractor_id = ? WHERE complaint_ticket_no = ?`,
                    [dbStatus, contractorRows[0].contractor_id, id]
                );
            } else {
                await pool.query(
                    `UPDATE complaints SET status = ? WHERE complaint_ticket_no = ?`,
                    [dbStatus, id]
                );
            }
        } else {
            await pool.query(
                `UPDATE complaints SET status = ? WHERE complaint_ticket_no = ?`,
                [dbStatus, id]
            );
        }

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
