const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Generate a reset token and store its hash. Returns plaintext token for delivery (e.g., email/log).
async function createPasswordResetToken(userId, ttlMinutes = 30) {
  const tokenBytes = crypto.randomBytes(24); // 192 bits entropy
  const token = tokenBytes.toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.query(
      "INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (gen_random_uuid(), $1, $2, NOW() + ($3 || ' minutes')::interval)",
      [userId, hash, String(ttlMinutes)]
    );
  return token;
}

async function consumePasswordResetToken(token) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const res = await pool.query(
    `SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
    [hash]
  );
  const row = res.rows[0];
  if (!row) return null;
  // Mark used
  await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [row.id]);
  return row;
}

async function updateUserPassword(userId, newPassword) {
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, userId]);
}

module.exports = {
  createPasswordResetToken,
  consumePasswordResetToken,
  updateUserPassword,
};