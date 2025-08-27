const express = require('express');
const cors = require('cors');
const winston = require('winston');

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/users.routes');
const vulnerabilityRoutes = require('./api/routes/vulnerabilities.routes');

const app = express();

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

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the OpenVLog backend!');
});

module.exports = app;
