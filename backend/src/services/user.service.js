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

const loginUser = async (username, password) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) {
        return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return null;
    }
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

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUsers,
    addUser,
    deleteUser,
};
