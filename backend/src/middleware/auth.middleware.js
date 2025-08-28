const jwt = require('jsonwebtoken');
const { HttpError } = require('./error.middleware');
const logger = require('../logger');

const verifyToken = (token) => new Promise((resolve, reject) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return reject(err);
    resolve(user);
  });
});

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) throw new HttpError(401, 'Missing token', 'AUTH');
  const user = await verifyToken(token);
  req.user = user;
  logger.debug && logger.debug({ msg: 'Authenticated request', user: user && user.id });
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      logger.warn({ msg: 'Token invalid or expired', error: err.message });
      return next(new HttpError(401, 'Invalid or expired token', 'AUTH'));
    }
    logger.error({ msg: 'Token auth error', error: err.message });
    next(err);
  }
};

module.exports = { authenticateToken };
