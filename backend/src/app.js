const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const helmet = require('helmet');

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/users.routes');
const vulnerabilityRoutes = require('./api/routes/vulnerabilities.routes');
const attachmentsRoutes = require('./api/routes/attachments.routes.js');
const notificationsRoutes = require('./api/routes/notifications.routes.js');
const twofaRoutes = require('./api/routes/twofa.routes.js');
const reportRoutes = require('./api/routes/report.routes.js');
const setupRoutes = require('./api/routes/setup.routes');
const versionRoutes = require('./api/routes/version.routes');
const { errorHandler } = require('./middleware/error.middleware');
const requestId = require('./middleware/requestId.middleware');
const logger = require('./logger');
const client = require('prom-client');

const app = express();

app.use(requestId);
// Structured access log
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const diffMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info('http.access', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Number(diffMs.toFixed(2)),
      ip: req.ip,
    });
  });
  next();
});
// Security headers
const allowInline = process.env.ALLOW_INLINE_CSP === 'true';
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": allowInline ? ["'self'", "'unsafe-inline'"] : ["'self'"],
      "style-src": allowInline ? ["'self'", "'unsafe-inline'"] : ["'self'"],
      "img-src": ["'self'", 'data:'],
      "connect-src": ["'self'", process.env.FRONTEND_ORIGIN || 'http://localhost:5173'],
    }
  },
  crossOriginEmbedderPolicy: false,
}));

// Prometheus metrics setup
client.collectDefaultMetrics();
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const diffNs = Number(process.hrtime.bigint() - start);
    const seconds = diffNs / 1e9;
    const route = req.route?.path || req.path;
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(seconds);
  });
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// --- Swagger API Documentation Setup ---
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'OpenVulog API',
      version: '1.0.0',
      description: 'Interactive API documentation for the OpenVulog application. Use the "Authorize" button to authenticate with a JWT token.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer {token}',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server'
      }
    ],
  },
  // Path to the API docs
  apis: ['./src/api/routes/*.js', './src/validation/schemas.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OpenVulog API Docs',
}));
// --- End Swagger Setup ---

app.use('/api/setup', setupRoutes); // must come before auth guard checks by clients
app.use('/version', versionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/2fa', twofaRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the OpenVulog backend!');
});

app.get('/healthz', async (req, res) => {
  const start = Date.now();
  try {
    // Optional DB probe if pool available
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', uptime: process.uptime(), latency_ms: Date.now() - start });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

let readinessCache = { ready: false, lastCheck: 0 };
app.get('/readyz', async (_req, res) => {
  const now = Date.now();
  if (readinessCache.ready && now - readinessCache.lastCheck < 10000) {
    return res.json({ status: 'ready', cached: true });
  }
  try {
    const pool = require('./config/db');
    // Ensure migrations table exists and at least baseline applied
    const result = await pool.query("SELECT 1 FROM _migrations LIMIT 1");
    readinessCache = { ready: true, lastCheck: now };
    return res.json({ status: 'ready' });
  } catch (err) {
    return res.status(503).json({ status: 'not_ready', error: err.message });
  }
});

app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Error handler (after routes)
app.use(errorHandler);

module.exports = app;
