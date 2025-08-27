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

app.listen(port, () => {
  logger.info(`Backend server listening at http://localhost:${port}`);
});