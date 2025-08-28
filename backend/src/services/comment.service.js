const pool = require('../config/db');

const listComments = async (vulnerabilityId) => {
  const res = await pool.query(
    'SELECT vc.id, vc.body, vc.created_at, vc.user_id, u.username FROM vulnerability_comments vc JOIN users u ON vc.user_id = u.id WHERE vc.vulnerability_id = $1 ORDER BY vc.created_at ASC',
    [vulnerabilityId]
  );
  return res.rows;
};

const addComment = async (vulnerabilityId, userId, body) => {
  const res = await pool.query(
    'INSERT INTO vulnerability_comments (vulnerability_id, user_id, body) VALUES ($1, $2, $3) RETURNING id, body, created_at, user_id',
    [vulnerabilityId, userId, body]
  );
  return res.rows[0];
};

module.exports = { listComments, addComment };
