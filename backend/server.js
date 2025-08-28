const app = require('./src/app');
const logger = require('./src/logger');

const port = process.env.PORT || 3001;

// Critical env validation
const requiredEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  // Fail fast to avoid runtime crashes later
  process.exit(1);
}

const server = app.listen(port, () => {
  logger.info(`Backend server listening at http://localhost:${port}`);
});

const shutdown = async (signal) => {
  logger.info('shutdown.initiated', { signal });
  try {
    await new Promise(res => server.close(res));
    logger.info('http.server.closed');
    try {
      const pool = require('./src/config/db');
      await pool.end();
      logger.info('db.pool.closed');
    } catch (e) {
      logger.warn('db.pool.close.error', { error: e.message });
    }
  } catch (e) {
    logger.error('shutdown.error', { error: e.message });
  } finally {
    // Allow transports to flush
    setTimeout(() => process.exit(0), 500);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));