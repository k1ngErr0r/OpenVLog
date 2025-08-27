const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const winston = require('winston');

const app = express();
const port = 3001;

const JWT_SECRET = fs.readFileSync('/run/secrets/jwt_secret', 'utf8').trim();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure Winston logger
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
app.use(cors()); // Enable CORS for all origins

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    logger.warn('Authentication attempt without token.');
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Authentication failed: ${err.message}`);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Middleware to check for admin privileges
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    logger.warn(`Access denied for user ${req.user.userId}: Admin access required.`);
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

app.get('/', (req, res) => {
  res.send('Hello from the OpenVLog backend!');
});

// --- AUTH ROUTES --- //
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    logger.warn('Registration attempt with missing username or password.');
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, is_admin',
      [username, hashedPassword]
    );
    logger.info(`User registered: ${username}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      logger.warn(`Registration failed: Username ${username} already exists.`);
      return res.status(409).json({ error: 'Username already exists' });
    }
    logger.error(`Registration error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    logger.warn('Login attempt with missing username or password.');
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    logger.info(`Login attempt for user: ${username}`);
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) {
      logger.warn(`Login failed for ${username}: User not found.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Login failed for ${username}: Invalid password.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '1h' });
    logger.info(`User ${username} logged in successfully.`);
    res.json({ token });
  } catch (error) {
    logger.error(`Login error for ${username}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- VULNERABILITY ROUTES --- //

// Get all vulnerabilities
app.get('/api/vulnerabilities', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vulnerabilities ORDER BY reported_at DESC');
    logger.info('Fetched all vulnerabilities.');
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching vulnerabilities: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single vulnerability by ID
app.get('/api/vulnerabilities/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM vulnerabilities WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      logger.warn(`Vulnerability ${id} not found.`);
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    logger.info(`Fetched vulnerability: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error fetching vulnerability ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new vulnerability
app.post('/api/vulnerabilities', [authenticateToken, isAdmin], async (req, res) => {
  const { name, description, severity, status } = req.body;
  if (!name) {
    logger.warn('Attempt to add vulnerability with missing name.');
    return res.status(400).json({ error: 'Vulnerability name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO vulnerabilities (name, description, severity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, severity, status]
    );
    logger.info(`Vulnerability added: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error adding vulnerability ${name}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a vulnerability
app.put('/api/vulnerabilities/:id', [authenticateToken, isAdmin], async (req, res) => {
  const { id } = req.params;
  const { name, description, severity, status } = req.body;
  if (!name) {
    logger.warn(`Attempt to update vulnerability ${id} with missing name.`);
    return res.status(400).json({ error: 'Vulnerability name is required' });
  }
  try {
    const result = await pool.query(
      'UPDATE vulnerabilities SET name = $1, description = $2, severity = $3, status = $4 WHERE id = $5 RETURNING *',
      [name, description, severity, status, id]
    );
    if (result.rows.length === 0) {
      logger.warn(`Vulnerability ${id} not found for update.`);
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    logger.info(`Vulnerability updated: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating vulnerability ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a vulnerability
app.delete('/api/vulnerabilities/:id', [authenticateToken, isAdmin], async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM vulnerabilities WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      logger.warn(`Vulnerability ${id} not found for deletion.`);
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    logger.info(`Vulnerability deleted: ${id}`);
    res.status(204).send(); // No Content
  } catch (error) {
    logger.error(`Error deleting vulnerability ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- USER MANAGEMENT ROUTES --- //

// Get all users
app.get('/api/users', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, is_admin FROM users ORDER BY id ASC');
    logger.info('Fetched all users.');
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new user (admin only)
app.post('/api/users', [authenticateToken, isAdmin], async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    logger.warn('Attempt to add user with missing username or password.');
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, is_admin',
      [username, hashedPassword]
    );
    logger.info(`User added: ${username}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      logger.warn(`Add user failed: Username ${username} already exists.`);
      return res.status(409).json({ error: 'Username already exists' });
    }
    logger.error(`Error adding user ${username}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user (admin only)
app.delete('/api/users/:id', [authenticateToken, isAdmin], async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      logger.warn(`User ${id} not found for deletion.`);
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info(`User deleted: ${id}`);
    res.status(204).send(); // No Content
  } catch (error) {
    logger.error(`Error deleting user ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  logger.info(`Backend server listening at http://localhost:${port}`);
});