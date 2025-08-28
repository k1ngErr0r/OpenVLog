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

const issueTokens = (user) => {
  const accessToken = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id, tokenType: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new HttpError(400, 'Username and password are required', 'VALIDATION');
  const user = await userService.loginUser(username, password);
  if (!user) throw new HttpError(401, 'Invalid credentials', 'AUTH');
  const { accessToken, refreshToken } = issueTokens(user);
  setRefreshCookie(res, refreshToken);
  res.json({ token: accessToken, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
};

const refresh = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) throw new HttpError(401, 'Missing refresh token', 'AUTH');
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (payload.tokenType !== 'refresh') throw new Error('Invalid token type');
    // Optionally validate user still exists
    const user = await userService.getUserById(payload.userId);
    if (!user) throw new HttpError(401, 'User no longer exists', 'AUTH');
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
  res.json({ token: accessToken, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
  } catch (err) {
    throw new HttpError(401, 'Invalid refresh token', 'AUTH');
  }
};

const logout = async (_req, res) => {
  res.clearCookie('refresh_token', { path: '/api/auth' });
  res.status(204).send();
};

const me = async (req, res) => {
  // authenticateToken middleware populates req.user (add in routes)
  const user = await userService.getUserById(req.user.userId);
  if (!user) throw new HttpError(404, 'User not found', 'NOT_FOUND');
  res.json({ id: user.id, username: user.username, isAdmin: user.is_admin });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
