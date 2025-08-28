const jwt = require('jsonwebtoken');
const winston = require('winston');
const userService = require('../../services/user.service');
const { HttpError } = require('../../middleware/error.middleware');

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
  if (!username || !password) throw new HttpError(400, 'Username and password are required', 'VALIDATION');
  try {
    const user = await userService.registerUser(username, password);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'Username already exists', 'DUPLICATE');
    throw error;
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new HttpError(400, 'Username and password are required', 'VALIDATION');
  const user = await userService.loginUser(username, password);
  if (!user) throw new HttpError(401, 'Invalid credentials', 'AUTH');
  const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

module.exports = {
    register,
    login,
};
