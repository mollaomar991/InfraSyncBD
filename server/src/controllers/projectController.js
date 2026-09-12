import pool from '../config/db.js';

// =============================================
// Task 1: Projects API - Module 2
// 5 Functions: Create, GetAll, GetById, Update, Delete
// =============================================

// --- 1. Create a new project (POST /api/projects) ---
export const createProject = async (req, res) => {
    // Read camelCase fields sent from React frontend
    const {
        name: project_name,
        type: project_type,
        description,
        budget,
        startDate: start_date,
        endDate: target_completion_date,
        road: road_name,
        area: area_name,
        coordinates,
        priority
    } = req.body;

    try {
        // Find the officer_id of the logged-in user
        const [officer] = await pool.query(
            'SELECT officer_id, department_id FROM officer_profiles WHERE user_id = ?',
            [req.user.userId]
        );

        if (officer.length === 0) {
            return res.status(403).json({ success: false, message: 'Officer profile not found' });
        }

        const officerId = officer[0].officer_id;
        const departmentId = officer[0].department_id;

        // Generate a unique project code
        const projectCode = `PRJ-${Date.now().toString().slice(-8)}`;

        // Format dates for MySQL (YYYY-MM-DD)
        const formatForMySQL = (dateString) => {
            if (!dateString) return null;
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        const mysqlStartDate = formatForMySQL(start_date);
        const mysqlEndDate = formatForMySQL(target_completion_date);

        // Start transaction - save data in both tables simultaneously
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Step 1: Insert into projects table
            const [projectResult] = await connection.query(
                `INSERT INTO projects 
                (project_code, project_name, project_type, description, department_id, created_by_officer_id, budget, start_date, target_completion_date, status, priority) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
                [projectCode, project_name, project_type, description, departmentId, officerId, budget, mysqlStartDate, mysqlEndDate, priority || 'medium']
            );

            const projectId = projectResult.insertId;

            // Step 2: Insert GIS data into project_locations table
            if (coordinates && coordinates.length > 0) {
                const geometryType = coordinates.length > 1 ? 'polyline' : 'point';
                const coordinatesJson = JSON.stringify(coordinates);
                // Use the first coordinate as the main anchor for the NOT NULL columns
                const [latitude, longitude] = coordinates[0];
                
                await connection.query(
                    `INSERT INTO project_locations 
                    (project_id, road_name, area_name, latitude, longitude, geometry_type, coordinates_json) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [projectId, road_name || 'N/A', area_name || 'N/A', latitude, longitude, geometryType, coordinatesJson]
                );
            }

            // =============================================
            // Step 3 (Phase 3): AUTO CONFLICT DETECTION
            // Check if any existing project uses the SAME road
            // AND has overlapping dates with this new project.
            // =============================================
            let conflictsFound = false;

            if (road_name) {
                const [overlapping] = await connection.query(
                    `SELECT p.project_id, p.project_name, p.department_id,
                            p.start_date, p.target_completion_date
                     FROM projects p
                     JOIN project_locations pl ON p.project_id = pl.project_id
                     WHERE pl.road_name = ?
                       AND p.project_id != ?
                       AND p.status NOT IN ('completed', 'cancelled', 'archived')
                       AND p.start_date <= ?
                       AND p.target_completion_date >= ?`,
                    [road_name, projectId, mysqlEndDate, mysqlStartDate]
                );

                // For every overlapping project, insert a conflict_alert row
                for (const existing of overlapping) {
                    conflictsFound = true;

                    await connection.query(
                        `INSERT INTO conflict_alerts
                         (project_id, conflicting_project_id, conflict_level, conflict_reason, recommended_sequence, resolution_status)
                         VALUES (?, ?, 'high', ?, ?, 'detected')`,
                        [
                            projectId,
                            existing.project_id,
                            `Both projects involve work on "${road_name}" with overlapping schedules (${mysqlStartDate} – ${mysqlEndDate}).`,
                            `Coordinate with the other department to stagger work periods and avoid simultaneous road excavation.`
                        ]
                    );
                }
            }

            // =============================================
            // DECIDE PROJECT STATUS based on conflict result
            // =============================================
            if (conflictsFound) {
                // Scenario B: Conflict detected → status = 'conflict_detected'
                // Officer must manually send coordination request (Step 4)
                await connection.query(
                    `UPDATE projects SET status = 'conflict_detected' WHERE project_id = ?`,
                    [projectId]
                );
            } else {
                // Scenario A: No conflict → auto approve → status = 'final_approved'
                await connection.query(
                    `UPDATE projects SET status = 'final_approved' WHERE project_id = ?`,
                    [projectId]
                );
            }

            await connection.commit();

            res.status(201).json({
                success: true,
                message: conflictsFound
                    ? 'Project created. Conflicts detected — please send coordination request from Conflicts page.'
                    : 'No conflict detected. Project is approved!',
                data: { project_id: projectId, project_code: projectCode, conflictsFound }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, message: 'Server error creating project' });
    }
};

// --- 2. View all projects (GET /api/projects) ---
export const getProjects = async (req, res) => {
    try {
        const [projects] = await pool.query(`
            SELECT p.*, 
                   pl.road_name, pl.area_name, pl.latitude, pl.longitude, pl.geometry_type, pl.coordinates_json,
                   d.department_name, 
                   u.full_name as officer_name
            FROM projects p
            LEFT JOIN project_locations pl ON p.project_id = pl.project_id
            LEFT JOIN departments d ON p.department_id = d.department_id
            LEFT JOIN officer_profiles op ON p.created_by_officer_id = op.officer_id
            LEFT JOIN users u ON op.user_id = u.user_id
            WHERE p.is_archived = FALSE
            ORDER BY p.created_at DESC
        `);

        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Server error fetching projects' });
    }
};

// --- 3. View details of a specific project (GET /api/projects/:id) ---
export const getProjectById = async (req, res) => {
    try {
        const [projects] = await pool.query(`
            SELECT p.*, 
                   pl.road_name, pl.area_name, pl.latitude, pl.longitude, pl.geometry_type, pl.coordinates_json,
                   d.department_name, 
                   u.full_name as officer_name
            FROM projects p
            LEFT JOIN project_locations pl ON p.project_id = pl.project_id
            LEFT JOIN departments d ON p.department_id = d.department_id
            LEFT JOIN officer_profiles op ON p.created_by_officer_id = op.officer_id
            LEFT JOIN users u ON op.user_id = u.user_id
            WHERE p.project_id = ?
        `, [req.params.id]);

        if (projects.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, data: projects[0] });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ success: false, message: 'Server error fetching project' });
    }
};

// --- 4. Update a project (PUT /api/projects/:id) ---
export const updateProject = async (req, res) => {
    const { project_name, project_type, description, budget, start_date, target_completion_date, priority, status } = req.body;

    try {
        // Check if this project belongs to the officer
        const [officer] = await pool.query(
            'SELECT officer_id FROM officer_profiles WHERE user_id = ?',
            [req.user.userId]
        );

        if (officer.length === 0) {
            return res.status(403).json({ success: false, message: 'Officer profile not found' });
        }

        const [existing] = await pool.query(
            'SELECT * FROM projects WHERE project_id = ? AND created_by_officer_id = ?',
            [req.params.id, officer[0].officer_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found or you are not the owner' });
        }

        // Update project details
        await pool.query(
            `UPDATE projects SET 
                project_name = COALESCE(?, project_name),
                project_type = COALESCE(?, project_type),
                description = COALESCE(?, description),
                budget = COALESCE(?, budget),
                start_date = COALESCE(?, start_date),
                target_completion_date = COALESCE(?, target_completion_date),
                priority = COALESCE(?, priority),
                status = COALESCE(?, status)
            WHERE project_id = ?`,
            [project_name, project_type, description, budget, start_date, target_completion_date, priority, status, req.params.id]
        );

        res.json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: 'Server error updating project' });
    }
};

// --- 5. Delete a project (DELETE /api/projects/:id) ---
export const deleteProject = async (req, res) => {
    try {
        // Check if this project belongs to the officer and is in draft status
        const [officer] = await pool.query(
            'SELECT officer_id FROM officer_profiles WHERE user_id = ?',
            [req.user.userId]
        );

        if (officer.length === 0) {
            return res.status(403).json({ success: false, message: 'Officer profile not found' });
        }

        const [existing] = await pool.query(
            'SELECT * FROM projects WHERE project_id = ? AND created_by_officer_id = ?',
            [req.params.id, officer[0].officer_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found or you are not the owner' });
        }

        // Only draft projects can be deleted
        if (existing[0].status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Only draft projects can be deleted' });
        }

        await pool.query('DELETE FROM projects WHERE project_id = ?', [req.params.id]);

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: 'Server error deleting project' });
    }
};
