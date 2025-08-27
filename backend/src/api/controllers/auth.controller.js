const jwt = require('jsonwebtoken');
const winston = require('winston');
const userService = require('../../services/user.service');

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

const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        logger.warn('Registration attempt with missing username or password.');
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = await userService.registerUser(username, password);
        logger.info(`User registered: ${username}`);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === '23505') {
            logger.warn(`Registration failed: Username ${username} already exists.`);
            return res.status(409).json({ error: 'Username already exists' });
        }
        logger.error(`Registration error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        logger.warn('Login attempt with missing username or password.');
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        logger.info(`Login attempt for user: ${username}`);
        const user = await userService.loginUser(username, password);
        if (!user) {
            logger.warn(`Login failed for ${username}: User not found or invalid password.`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
        logger.info(`User ${username} logged in successfully.`);
        res.json({ token });
    } catch (error) {
        logger.error(`Login error for ${username}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register,
    login,
};
