const app = require('./src/app');
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

const port = process.env.PORT || 3001;

// Critical env validation
const requiredEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  // Fail fast to avoid runtime crashes later
  process.exit(1);
}

app.listen(port, () => {
  logger.info(`Backend server listening at http://localhost:${port}`);
});