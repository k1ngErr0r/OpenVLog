const pool = require('../config/db');

// Simple in-process subscribers map for SSE (user_id => Set<function(notification)>)
const subscribers = new Map();

const subscribe = (userId, fn) => {
    if (!subscribers.has(userId)) subscribers.set(userId, new Set());
    subscribers.get(userId).add(fn);
    return () => {
        const set = subscribers.get(userId);
        if (set) {
            set.delete(fn);
            if (!set.size) subscribers.delete(userId);
        }
    };
};

const publish = (userId, notification) => {
    const set = subscribers.get(userId);
    if (set) {
        for (const fn of set) {
            try { fn(notification); } catch (_) { /* ignore individual errors */ }
        }
    }
};

const createNotification = async (user_id, message, link) => {
    const result = await pool.query(
        'INSERT INTO notifications (user_id, message, link) VALUES ($1, $2, $3) RETURNING *',
        [user_id, message, link]
    );
    const n = result.rows[0];
    // Push to any SSE subscribers
    publish(user_id, n);
    return n;
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
    subscribe,
};