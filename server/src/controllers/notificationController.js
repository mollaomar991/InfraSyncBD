import pool from '../config/db.js';

export const getNotifications = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM system_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
            [req.user.userId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE system_notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?`,
            [id, req.user.userId]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE system_notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
            [req.user.userId]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
