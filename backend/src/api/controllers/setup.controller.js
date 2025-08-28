const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const { HttpError } = require('../../middleware/error.middleware');

const checkStatus = async (_req, res) => {
  const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  const needsSetup = result.rows[0].count === 0;
  res.json({ needsSetup });
};

const initialize = async (req, res) => {
  const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (result.rows[0].count > 0) throw new HttpError(400, 'System already initialized', 'SETUP');
  const { username, password } = req.body;
  if (!username || !password) throw new HttpError(400, 'Username and password required', 'VALIDATION');
  const hash = await bcrypt.hash(password, 10);
  const insert = await pool.query('INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, TRUE) RETURNING id, username, is_admin', [username, hash]);
  console.log('[setup] Initial admin created:', insert.rows[0].username, 'id=', insert.rows[0].id);
  res.status(201).json({ admin: insert.rows[0] });
};

module.exports = { checkStatus, initialize };