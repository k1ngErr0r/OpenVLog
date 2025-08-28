const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Environment-driven configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_TO_FILE = (() => {
  if (process.env.LOG_TO_FILE != null) {
    return /^(1|true|yes)$/i.test(process.env.LOG_TO_FILE);
  }
  return process.env.NODE_ENV === 'production';
})();
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_FILE = process.env.LOG_FILE || 'app.log';
const LOG_ROTATE = /^(1|true|yes)$/i.test(process.env.LOG_ROTATE || 'false');
const LOG_ROTATE_MAX_SIZE = process.env.LOG_ROTATE_MAX_SIZE || '5m';
const LOG_ROTATE_MAX_FILES = process.env.LOG_ROTATE_MAX_FILES || '14d';

const transports = [new winston.transports.Console()];

if (LOG_TO_FILE) {
  try {
    const dirPath = path.resolve(LOG_DIR);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    if (LOG_ROTATE) {
      // Lazy require to avoid dependency cost if unused
      try {
        const DailyRotateFile = require('winston-daily-rotate-file');
        transports.push(
          new DailyRotateFile({
            dirname: dirPath,
            filename: LOG_FILE.replace(/\.log$/, '') + '-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: LOG_ROTATE_MAX_SIZE,
            maxFiles: LOG_ROTATE_MAX_FILES,
          })
        );
      } catch (e) {
        console.error('[logger] Rotation requested but winston-daily-rotate-file not installed:', e.message);
        transports.push(
          new winston.transports.File({
            filename: path.join(dirPath, LOG_FILE),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 3,
          })
        );
      }
    } else {
      transports.push(
        new winston.transports.File({
          filename: path.join(dirPath, LOG_FILE),
          maxsize: 5 * 1024 * 1024,
          maxFiles: 3,
        })
      );
    }
  } catch (e) {
    // Fallback: log the problem to console only
    // eslint-disable-next-line no-console
    console.error('[logger] Failed to initialize file logging:', e.message);
  }
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

module.exports = logger;
