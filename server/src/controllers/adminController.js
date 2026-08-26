import pool from '../config/db.js';

export const getPendingVerifications = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.user_id, u.full_name, u.email, u.account_status, r.role_name,
            op.designation, d.department_name, cp.company_name, u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN officer_profiles op ON u.user_id = op.user_id
            LEFT JOIN departments d ON op.department_id = d.department_id
            LEFT JOIN contractor_profiles cp ON u.user_id = cp.user_id
            WHERE u.account_status = 'pending_verification'
            ORDER BY u.created_at DESC
        `);
        
        const registrations = rows.map(row => ({
            id: row.user_id.toString(),
            name: row.full_name,
            email: row.email,
            role: row.role_name === 'department_officer' ? 'Department Officer' : 'Contractor',
            organization: row.department_name || row.company_name || 'Unknown',
            designation: row.designation || 'Contractor Company',
            submittedDate: new Date(row.created_at).toISOString().split('T')[0],
            documentCount: row.role_name === 'department_officer' ? 3 : 4,
            status: 'Pending Verification'
        }));
        
        res.json({ success: true, data: registrations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching pending verifications' });
    }
};

export const verifyUser = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'rejected'
    
    if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const dbStatus = status === 'active' ? 'active' : 'rejected';

    try {
        await pool.query('UPDATE users SET account_status = ? WHERE user_id = ?', [dbStatus, id]);
        res.json({ success: true, message: `User status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating user status' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.user_id as id, u.full_name as name, u.email, u.account_status as accountStatus, r.role_name as role,
            d.department_name, cp.company_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN officer_profiles op ON u.user_id = op.user_id
            LEFT JOIN departments d ON op.department_id = d.department_id
            LEFT JOIN contractor_profiles cp ON u.user_id = cp.user_id
        `);
        
        const formatted = rows.map(row => ({
            ...row,
            id: row.id.toString(),
            organization: row.department_name || row.company_name || (row.role === 'super_admin' ? 'InfraSync BD Administration' : 'Public User'),
            accountStatus: row.accountStatus === 'active' ? 'Active' : (row.accountStatus === 'pending_verification' ? 'Pending Verification' : 'Suspended')
        }));
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

export const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    let dbStatus = 'active';
    if (status === 'Suspended') dbStatus = 'suspended';
    else if (status === 'Pending Verification') dbStatus = 'pending_verification';

    try {
        await pool.query('UPDATE users SET account_status = ? WHERE user_id = ?', [dbStatus, id]);
        res.json({ success: true, message: `User status updated` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating user status' });
    }
};
