const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

module.exports = function requestId(req, res, next) {
  const id = uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  const start = Date.now();
  logger.info({ msg: 'request:start', id, method: req.method, url: req.originalUrl });
  res.on('finish', () => {
    logger.info({ msg: 'request:finish', id, method: req.method, url: req.originalUrl, status: res.statusCode, duration_ms: Date.now() - start });
  });
  next();
};
