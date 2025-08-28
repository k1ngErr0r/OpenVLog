const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const winston = require('winston');

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/users.routes');
const vulnerabilityRoutes = require('./api/routes/vulnerabilities.routes');
const { errorHandler } = require('./middleware/error.middleware');
const requestId = require('./middleware/requestId.middleware');
const logger = require('./logger');

const app = express();

app.use(requestId);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the OpenVLog backend!');
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

// Error handler (after routes)
app.use(errorHandler);

module.exports = app;
