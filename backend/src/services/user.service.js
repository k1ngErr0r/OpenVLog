const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const registerUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, is_admin',
        [username, hashedPassword]
    );
    return result.rows[0];
};

// Basic fetch helpers
const getUserById = async (id) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};

const findByUsername = async (username) => {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
};

// Lockout helpers
const resetFailedAttempts = async (userId) => {
    await pool.query('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = $1', [userId]);
};

const incrementFailedAttempts = async (userId, maxAttempts, lockDurationMinutes) => {
    // Increment and decide lock
    const res = await pool.query(
        'UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = $1 RETURNING failed_attempts',
        [userId]
    );
    const attempts = res.rows[0]?.failed_attempts || 0;
    let justLocked = false;
    if (attempts >= maxAttempts) {
        justLocked = true;
        await pool.query(
            'UPDATE users SET lock_until = NOW() + ($2 || \' minutes\')::interval, failed_attempts = 0 WHERE id = $1',
            [userId, String(lockDurationMinutes)]
        );
    }
    return { attempts, justLocked };
};

const clearLockIfExpired = async (user) => {
    if (user.lock_until && new Date(user.lock_until).getTime() <= Date.now()) {
        await resetFailedAttempts(user.id);
        return { ...user, failed_attempts: 0, lock_until: null };
    }
    return user;
};

// Legacy loginUser retained (without lockout) for any other callers – prefer new attemptLogin flow in controller
const loginUser = async (username, password) => {
    const user = await findByUsername(username);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;
    return user;
};

const getAllUsers = async () => {
    const result = await pool.query('SELECT id, username, is_admin FROM users ORDER BY id ASC');
    return result.rows;
};

const getUsers = async ({ page, pageSize, search }) => {
    const where = [];
    const values = [];
    let i = 1;
    if (search) {
        where.push(`username ILIKE $${i}`);
        values.push(`%${search}%`);
        i++;
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`.trim(), values);
    const total = parseInt(countRes.rows[0].count, 10);
    values.push(pageSize, (page - 1) * pageSize);
    const listRes = await pool.query(
        `SELECT id, username, is_admin FROM users ${whereClause} ORDER BY id ASC LIMIT $${i} OFFSET $${i + 1}`.trim(),
        values
    );
    return { data: listRes.rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 0 };
};

const addUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, is_admin',
        [username, hashedPassword]
    );
    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
};

const getAllAdminUsers = async () => {
    const result = await pool.query('SELECT id, username FROM users WHERE is_admin = TRUE');
    return result.rows;
};

module.exports = {
    registerUser,
    loginUser, // legacy
    getAllUsers,
    getUsers,
    addUser,
    deleteUser,
    // new helpers
    getUserById,
    findByUsername,
    resetFailedAttempts,
    incrementFailedAttempts,
    clearLockIfExpired,
        getUserById,
};
