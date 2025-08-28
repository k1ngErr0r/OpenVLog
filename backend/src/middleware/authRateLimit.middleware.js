// Simple in-memory rate limiter for auth endpoints (login, refresh) per IP
// Not suitable for multi-instance without shared store
const windows = new Map();

const WINDOW_MS = parseInt(process.env.AUTH_RATE_WINDOW_MS || '60000', 10); // 1 min
const MAX_ATTEMPTS = parseInt(process.env.AUTH_RATE_MAX || '10', 10);

module.exports = function authRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = windows.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  windows.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many auth attempts, please slow down' });
  }
  next();
};
