const jwt = require('jsonwebtoken');
const logger = require('../../logger');
const userService = require('../../services/user.service');
const passwordResetService = require('../../services/passwordReset.service');
const { HttpError } = require('../../middleware/error.middleware');
const authMetrics = require('../../metrics/auth.metrics');
const { requestPasswordResetSchema, resetPasswordSchema } = require('../../validation/schemas');


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
    secure: true, // always secure when served behind HTTPS/Traefik
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new HttpError(400, 'Username and password are required', 'VALIDATION');

  // Configurable thresholds
  const MAX_ATTEMPTS = parseInt(process.env.AUTH_LOCK_MAX_ATTEMPTS || '5', 10);
  const LOCK_MINUTES = parseInt(process.env.AUTH_LOCK_DURATION_MIN || '15', 10);

  const user = await userService.findByUsername(username);
  if (!user) {
    // do not reveal existence
    authMetrics.loginFailure.inc();
    logger.warn('auth.login.failure', { username, ip: req.ip, reason: 'unknown_user' });
    throw new HttpError(401, 'Invalid credentials', 'AUTH');
  }

  // If locked check expiry
  if (user.lock_until) {
    const lockUntil = new Date(user.lock_until).getTime();
    if (lockUntil > Date.now()) {
      authMetrics.lockoutBlocked.inc();
      logger.warn('auth.login.locked', { userId: user.id, username: user.username, ip: req.ip });
      throw new HttpError(423, 'Account temporarily locked. Try again later.', 'LOCKED');
    } else {
      // auto clear expired lock
      await userService.resetFailedAttempts(user.id);
      user.failed_attempts = 0;
      user.lock_until = null;
    }
  }

  const passwordOk = await require('bcryptjs').compare(password, user.password_hash);
  if (!passwordOk) {
    const { justLocked, attempts } = await userService.incrementFailedAttempts(user.id, MAX_ATTEMPTS, LOCK_MINUTES);
    authMetrics.loginFailure.inc();
    if (justLocked) {
      authMetrics.lockoutTriggered.inc();
      logger.warn('auth.login.lockout_triggered', { userId: user.id, username: user.username, ip: req.ip, attempts });
      throw new HttpError(423, 'Account locked due to repeated failed logins', 'LOCKED');
    }
    logger.warn('auth.login.failure', { username, ip: req.ip, attempts });
    throw new HttpError(401, 'Invalid credentials', 'AUTH');
  }

  // success: reset attempts if any
  if (user.failed_attempts && user.failed_attempts > 0) {
    await userService.resetFailedAttempts(user.id);
  }

  const { accessToken, refreshToken } = issueTokens(user);
  setRefreshCookie(res, refreshToken);
  authMetrics.loginSuccess.inc();
  logger.info('auth.login.success', { userId: user.id, username: user.username, ip: req.ip });
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
  authMetrics.refreshSuccess.inc();
  logger.info('auth.refresh.success', { userId: user.id, ip: req.ip });
  res.json({ token: accessToken, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
  } catch (err) {
  authMetrics.refreshFailure.inc();
  logger.warn('auth.refresh.failure', { reason: err.message, ip: req.ip });
    throw new HttpError(401, 'Invalid refresh token', 'AUTH');
  }
};

const logout = async (req, res) => {
  res.clearCookie('refresh_token', { path: '/api/auth' });
  authMetrics.logout.inc();
  logger.info('auth.logout', { userId: req.user?.userId, ip: req.ip });
  res.status(204).send();
};

const me = async (req, res) => {
  // authenticateToken middleware populates req.user (add in routes)
  const user = await userService.getUserById(req.user.userId);
  if (!user) throw new HttpError(404, 'User not found', 'NOT_FOUND');
  res.json({ id: user.id, username: user.username, isAdmin: user.is_admin });
};

// Request password reset (no user enumeration in response)
const requestPasswordReset = async (req, res) => {
  const parsed = requestPasswordResetSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message, 'VALIDATION');
  const { username } = parsed.data;
  const user = await userService.findByUsername(username);
  if (user) {
    try {
      const token = await passwordResetService.createPasswordResetToken(user.id, parseInt(process.env.PASSWORD_RESET_TTL_MIN || '30', 10));
      authMetrics.passwordResetRequested.inc();
      logger.info('auth.password_reset.requested', { userId: user.id, username: user.username });
      // For now (no email), return token directly in secure dev mode only
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ message: 'If that user exists, a reset token has been generated', token });
      }
    } catch (e) {
      logger.error('auth.password_reset.request_error', { error: e.message });
    }
  }
  res.json({ message: 'If that user exists, a reset token has been generated' });
};

// Perform password reset
const resetPassword = async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message, 'VALIDATION');
  const { token, password } = parsed.data;
  try {
    const tokenRow = await passwordResetService.consumePasswordResetToken(token);
    if (!tokenRow) {
      authMetrics.passwordResetFailed.inc();
      throw new HttpError(400, 'Invalid or expired token', 'TOKEN');
    }
    await passwordResetService.updateUserPassword(tokenRow.user_id, password);
    authMetrics.passwordResetCompleted.inc();
    logger.info('auth.password_reset.completed', { userId: tokenRow.user_id });
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    if (e instanceof HttpError) throw e;
    logger.error('auth.password_reset.error', { error: e.message });
    throw new HttpError(500, 'Failed to reset password', 'ERROR');
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
};
