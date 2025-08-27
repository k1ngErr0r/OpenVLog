const winston = require('winston');

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

const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        logger.warn(`Access denied for user ${req.user.userId}: Admin access required.`);
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { isAdmin };
