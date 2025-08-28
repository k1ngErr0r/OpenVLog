const { Pool } = require('pg');
const logger = require('../logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Wrap query to add error logging with parameter context
const originalQuery = pool.query.bind(pool);
pool.query = async (text, params) => {
  try {
    return await originalQuery(text, params);
  } catch (err) {
    logger.error('DB query error', { message: err.message, text: sanitize(text), params: safeParams(params) });
    throw err;
  }
};

function sanitize(q) {
  // remove newlines for compact logging
  return q && q.replace(/\s+/g, ' ').trim();
}
function safeParams(p) {
  if (!Array.isArray(p)) return p;
  return p.map(v => (typeof v === 'string' && v.length > 100 ? v.slice(0, 100) + '…' : v));
}

module.exports = pool;
