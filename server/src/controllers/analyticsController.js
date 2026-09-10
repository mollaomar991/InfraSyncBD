import pool from '../config/db.js';

export const getDashboardAnalytics = async (req, res) => {
    try {
        // Query 1: Total and Active Projects
        const [projectData] = await pool.query(`
            SELECT 
                COUNT(*) as totalProjects,
                SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as activeProjects,
                SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as delayedProjects,
                SUM(CASE WHEN status = 'rework_required' THEN 1 ELSE 0 END) as reworkProjects
            FROM projects
        `);

        // Query 2: Complaints Summary
        const [complaintData] = await pool.query(`
            SELECT 
                COUNT(*) as totalComplaints,
                SUM(CASE WHEN status != 'resolved' AND status != 'closed' THEN 1 ELSE 0 END) as openComplaints
            FROM complaints
        `);

        // Query 3: Inspections Summary
        const [inspectionData] = await pool.query(`
            SELECT 
                COUNT(*) as totalInspections,
                SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as failedInspections
            FROM inspections
        `);

        res.json({
            success: true,
            data: {
                projects: projectData[0],
                complaints: complaintData[0],
                inspections: inspectionData[0]
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
