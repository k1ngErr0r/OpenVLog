const pool = require('../config/db');

const createNotification = async (user_id, message, link) => {
    // In a real-world app, you might also push to a WebSocket or other real-time service here
    const result = await pool.query(
        'INSERT INTO notifications (user_id, message, link) VALUES ($1, $2, $3) RETURNING *',
        [user_id, message, link]
    );
    return result.rows[0];
};

const getNotificationsByUserId = async (user_id) => {
    const result = await pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', // Limit to last 50
        [user_id]
    );
    return result.rows;
};

const getUnreadNotificationCount = async (user_id) => {
    const result = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [user_id]
    );
    return parseInt(result.rows[0].count, 10);
};

const markAsRead = async (notification_id, user_id) => {
    const result = await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
        [notification_id, user_id]
    );
    return result.rows[0];
};

const markAllAsRead = async (user_id) => {
    const result = await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING *',
        [user_id]
    );
    return result.rows;
};

module.exports = {
    createNotification,
    getNotificationsByUserId,
    getUnreadNotificationCount,
    markAsRead,
    markAllAsRead,
};