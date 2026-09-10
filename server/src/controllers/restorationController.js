import pool from '../config/db.js';

export const submitRestoration = async (req, res) => {
    try {
        const { projectId } = req.body;
        
        let beforePhotoUrl = 'no-photo.jpg';
        let afterPhotoUrl = 'no-photo.jpg';
        
        if (req.files) {
            if (req.files.beforePhoto) beforePhotoUrl = req.files.beforePhoto[0].filename;
            if (req.files.afterPhoto) afterPhotoUrl = req.files.afterPhoto[0].filename;
        }

        // Get contractor ID from logged in user
        const [contractorRows] = await pool.query('SELECT contractor_id FROM contractor_profiles WHERE user_id = ?', [req.user.userId]);
        const contractorId = contractorRows.length > 0 ? contractorRows[0].contractor_id : 1;

        const [result] = await pool.query(
            `INSERT INTO road_restorations (project_id, contractor_id, before_photo_url, after_photo_url) 
             VALUES (?, ?, ?, ?)`,
            [projectId, contractorId, beforePhotoUrl, afterPhotoUrl]
        );

        // Update project status
        await pool.query(`UPDATE projects SET status = 'restoration_pending' WHERE project_id = ?`, [projectId]);

        res.status(201).json({ success: true, message: 'Restoration evidence submitted', restorationId: result.insertId });
    } catch (error) {
        console.error('Error submitting restoration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const verifyRestoration = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body; // status: 'restoration_approved' or 'rework_required'
        
        // Find officer ID
        const [officerRows] = await pool.query('SELECT officer_id FROM officer_profiles WHERE user_id = ?', [req.user.userId]);
        const officerId = officerRows.length > 0 ? officerRows[0].officer_id : 1;

        await pool.query(
            `UPDATE road_restorations SET status = ?, verification_notes = ?, verified_by_officer_id = ?, verified_at = NOW() WHERE restoration_id = ?`,
            [status, notes, officerId, id]
        );
        
        // If approved, update project to completed
        if (status === 'restoration_approved') {
            const [restorationRows] = await pool.query(`SELECT project_id FROM road_restorations WHERE restoration_id = ?`, [id]);
            if (restorationRows.length > 0) {
                await pool.query(`UPDATE projects SET status = 'completed', actual_completion_date = NOW(), road_status = 'completed' WHERE project_id = ?`, [restorationRows[0].project_id]);
            }
        }

        res.json({ success: true, message: 'Restoration verification complete' });
    } catch (error) {
        console.error('Error verifying restoration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
