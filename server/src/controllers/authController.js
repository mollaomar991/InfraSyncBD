import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { name, email, phone, password, role, department, designation, companyName } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email or Phone already exists' });

        const [roleRows] = await pool.query('SELECT role_id FROM roles WHERE role_name = ?', [role]);
        if (roleRows.length === 0) return res.status(400).json({ success: false, message: 'Invalid role' });
        const roleId = roleRows[0].role_id;

        const hashedPassword = password;
        let accountStatus = (role === 'citizen' || role === 'super_admin') ? 'active' : 'pending_verification';
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [userResult] = await connection.query(
                'INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES (?, ?, ?, ?, ?, ?)',
                [roleId, name, email, phone, hashedPassword, accountStatus]
            );
            const userId = userResult.insertId;

            if (role === 'department_officer') {
                const [dept] = await connection.query('SELECT department_id FROM departments WHERE department_name = ?', [department || 'Roads and Highways Department']);
                const deptId = dept.length > 0 ? dept[0].department_id : 1;
                
                await connection.query(
                    'INSERT INTO officer_profiles (user_id, department_id, employee_id, designation, office_location, verification_document_url) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, deptId, `EMP-${Date.now()}`, designation || 'Officer', 'HQ', 'placeholder.jpg']
                );
            } else if (role === 'contractor') {
                await connection.query(
                    'INSERT INTO contractor_profiles (user_id, company_name, trade_license_no, contractor_license_no, office_address, license_document_url) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, companyName || 'Contractor Co', `TRD-${Date.now()}`, `LIC-${Date.now()}`, 'HQ', 'placeholder.jpg']
                );
            }

            await connection.commit();
            res.status(201).json({ success: true, message: 'Registration successful', status: accountStatus });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query(`
            SELECT u.*, r.role_name, 
            d.department_name as organization 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN officer_profiles op ON u.user_id = op.user_id
            LEFT JOIN departments d ON op.department_id = d.department_id
            WHERE u.email = ?`, [email]);
            
        if (users.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const user = users[0];
        if (password !== user.password_hash) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        if (user.account_status !== 'active') {
            return res.status(403).json({ success: false, message: `Account is ${user.account_status}` });
        }

        const token = jwt.sign({ userId: user.user_id, role: user.role_name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                role: user.role_name,
                organization: user.organization || (user.role_name === 'contractor' ? 'Contractor Company' : (user.role_name === 'super_admin' ? 'InfraSync BD Administration' : 'Public User')),
                accountStatus: user.account_status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

export const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.*, r.role_name, 
            d.department_name as organization 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN officer_profiles op ON u.user_id = op.user_id
            LEFT JOIN departments d ON op.department_id = d.department_id
            WHERE u.user_id = ?`, [req.user.userId]);
            
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        const user = users[0];
        
        res.json({
            success: true,
            user: {
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                role: user.role_name,
                organization: user.organization || (user.role_name === 'contractor' ? 'Contractor Company' : (user.role_name === 'super_admin' ? 'InfraSync BD Administration' : 'Public User')),
                accountStatus: user.account_status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching user' });
    }
};
