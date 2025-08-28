const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal server error' };
  if (err.code) payload.code = err.code;
  if (req.requestId) payload.requestId = req.requestId;
  logger.error('Request error', { status, message: err.message, stack: err.stack, requestId: req.requestId });
  res.status(status).json(payload);
};

module.exports = { errorHandler, HttpError };
