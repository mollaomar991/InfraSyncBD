import pool from '../config/db.js';

export const getInspections = async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = `
            SELECT i.*, p.project_name, cp.company_name as contractor_name, u.full_name as inspector_name
            FROM inspections i
            LEFT JOIN projects p ON i.project_id = p.project_id
            LEFT JOIN contractor_profiles cp ON p.assigned_contractor_id = cp.contractor_id
            LEFT JOIN officer_profiles op ON i.inspector_officer_id = op.officer_id
            LEFT JOIN users u ON op.user_id = u.user_id
        `;
        const params = [];
        
        if (projectId) {
            query += ` WHERE i.project_id = ?`;
            params.push(projectId);
        }
        
        query += ` ORDER BY i.scheduled_date DESC`;
        
        const [rows] = await pool.query(query, params);
        
        if (rows.length > 0) {
            const inspectionIds = rows.map(r => r.inspection_id);
            const [checklistItems] = await pool.query(`SELECT * FROM inspection_checklist_items WHERE inspection_id IN (?)`, [inspectionIds]);
            
            // Group checklist items by inspection_id
            const checklistMap = {};
            checklistItems.forEach(item => {
                if (!checklistMap[item.inspection_id]) {
                    checklistMap[item.inspection_id] = [];
                }
                checklistMap[item.inspection_id].push(item.criteria_title); // Since we just need an array of checked titles for now
            });
            
            rows.forEach(r => {
                r.checklist = checklistMap[r.inspection_id] || [];
            });
        }
        
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

export const saveInspectionResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { result, remarks, checklist } = req.body;
        
        // Update inspection record
        await pool.query(
            `UPDATE inspections SET result = ?, engineer_remarks = ?, completed_at = NOW() WHERE inspection_id = ?`,
            [result, remarks, id]
        );
        
        // Insert checklist items if provided (first clear old ones)
        if (checklist !== undefined && Array.isArray(checklist)) {
            await pool.query(`DELETE FROM inspection_checklist_items WHERE inspection_id = ?`, [id]);
            for (const item of checklist) {
                await pool.query(
                    `INSERT INTO inspection_checklist_items (inspection_id, criteria_title, status) VALUES (?, ?, ?)`,
                    [id, item, 'pass'] // Simplified since we are just storing checked item titles
                );
            }
        }

        // Rework logic: If failed, update project and milestone
        if (result === 'failed') {
            const [inspectionRows] = await pool.query(`SELECT project_id, milestone_id FROM inspections WHERE inspection_id = ?`, [id]);
            if (inspectionRows.length > 0) {
                const { project_id, milestone_id } = inspectionRows[0];
                await pool.query(`UPDATE projects SET status = 'rework_required' WHERE project_id = ?`, [project_id]);
                if (milestone_id) {
                    await pool.query(`UPDATE project_milestones SET status = 'rework_required' WHERE milestone_id = ?`, [milestone_id]);
                }
            }
        }
        
        res.json({ success: true, message: 'Inspection result saved.' });
    } catch (error) {
        console.error('Error saving inspection result:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
