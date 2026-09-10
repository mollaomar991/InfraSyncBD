import pool from '../config/db.js';

export const getInspections = async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = `SELECT * FROM inspections`;
        const params = [];
        
        if (projectId) {
            query += ` WHERE project_id = ?`;
            params.push(projectId);
        }
        
        query += ` ORDER BY scheduled_date DESC`;
        
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching inspections:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const scheduleInspection = async (req, res) => {
    try {
        const { projectId, scheduledDate } = req.body;
        
        // Find officer ID (simplified for easy logic)
        const [officerRows] = await pool.query('SELECT officer_id FROM officer_profiles WHERE user_id = ?', [req.user.userId]);
        const inspectorId = officerRows.length > 0 ? officerRows[0].officer_id : 1;
        
        const [result] = await pool.query(
            `INSERT INTO inspections (project_id, inspector_officer_id, scheduled_date) VALUES (?, ?, ?)`,
            [projectId, inspectorId, scheduledDate]
        );
        
        res.status(201).json({ success: true, message: 'Inspection scheduled', inspectionId: result.insertId });
    } catch (error) {
        console.error('Error scheduling inspection:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
