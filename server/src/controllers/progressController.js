import pool from '../config/db.js';

export const submitProgress = async (req, res) => {
    try {
        const { projectId, physicalProgress, financialProgress, completedWork, remainingWork, delayReason } = req.body;
        
        // Simple logic for photo upload
        let photoUrl = 'no-photo.jpg';
        if (req.file) {
            photoUrl = req.file.filename;
        }

        // Get contractor ID from logged in user
        // Assuming contractor_profiles table maps user_id to contractor_id
        const [contractorRows] = await pool.query('SELECT contractor_id FROM contractor_profiles WHERE user_id = ?', [req.user.userId]);
        
        // If not a contractor, maybe it's an officer testing. Just use ID 1 for simplicity if not found.
        const contractorId = contractorRows.length > 0 ? contractorRows[0].contractor_id : 1;
        
        const isDelayed = delayReason ? true : false;
        const updateDate = new Date().toISOString().split('T')[0];

        const [result] = await pool.query(
            `INSERT INTO progress_updates 
            (project_id, contractor_id, update_date, physical_progress_pct, financial_progress_pct, completed_work_summary, remaining_work_summary, photo_evidence_url, is_delayed, delay_reason) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [projectId, contractorId, updateDate, physicalProgress, financialProgress, completedWork, remainingWork, photoUrl, isDelayed, delayReason]
        );

        // Simple logic to update the main project status/progress
        await pool.query(
            `UPDATE projects SET physical_progress_pct = ?, financial_progress_pct = ?, status = ? WHERE project_id = ?`,
            [physicalProgress, financialProgress, isDelayed ? 'delayed' : 'ongoing', projectId]
        );

        res.status(201).json({ success: true, message: 'Progress updated successfully', progressId: result.insertId });
    } catch (error) {
        console.error('Error submitting progress:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getProgress = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [rows] = await pool.query(
            `SELECT * FROM progress_updates WHERE project_id = ? ORDER BY update_date DESC`,
            [projectId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
