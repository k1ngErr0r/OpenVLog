const winston = require('winston');

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/app.log', maxsize: 5 * 1024 * 1024, maxFiles: 3 }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

module.exports = logger;
