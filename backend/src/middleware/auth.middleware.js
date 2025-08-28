const jwt = require('jsonwebtoken');
const winston = require('winston');
const { HttpError } = require('./error.middleware');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });

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
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new HttpError(403, 'Invalid or expired token', 'AUTH')); 
    }
    next(err);
  }
};

module.exports = { authenticateToken };
