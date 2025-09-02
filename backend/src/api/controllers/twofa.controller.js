const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const pool = require('../../config/db');
const { HttpError } = require('../../middleware/error.middleware');

const currentUserId = (req) => req.user && (req.user.userId || req.user.id);

// Generate setup secret and QR (not yet enabled)
const setup = async (req, res, next) => {
  try {
    const uid = currentUserId(req); if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
    const secret = authenticator.generateSecret();
    const userResult = await pool.query('SELECT username FROM users WHERE id=$1', [uid]);
    const username = userResult.rows[0]?.username || 'user';
    const issuer = 'OpenVulog';
    const otpauth = authenticator.keyuri(username, issuer, secret);
    const qr = await qrcode.toDataURL(otpauth);
    // Store temp secret in memory? For simplicity client will echo it back; production would stash server-side.
    res.json({ secret, otpauth, qr });
  } catch (e) { next(e); }
};

// Enable: verify code & persist secret
const enable = async (req, res, next) => {
  try {
    const uid = currentUserId(req); if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
    const { secret, code } = req.body || {};
    if (!secret || !code) throw new HttpError(400, 'secret and code required', 'BAD_REQUEST');
    const valid = authenticator.verify({ token: code, secret });
    if (!valid) throw new HttpError(400, 'Invalid code', 'INVALID_CODE');
    await pool.query('UPDATE users SET two_factor_enabled=TRUE, two_factor_secret=$1 WHERE id=$2', [secret, uid]);
    res.status(204).send();
  } catch (e) { next(e); }
};

// Verify during login second step: we assume auth middleware allowed temp token with purpose 2fa (simplified here)
const verify = async (req, res, next) => {
  try {
    const uid = currentUserId(req); if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
    const { code } = req.body || {};
    if (!code) throw new HttpError(400, 'code required', 'BAD_REQUEST');
    const result = await pool.query('SELECT two_factor_secret FROM users WHERE id=$1', [uid]);
    const secret = result.rows[0]?.two_factor_secret;
    if (!secret) throw new HttpError(400, '2FA not enabled', 'NOT_ENABLED');
    const valid = authenticator.verify({ token: code, secret });
    if (!valid) throw new HttpError(400, 'Invalid code', 'INVALID_CODE');
    // Issue normal tokens: reuse existing login issue logic perhaps via auth controller; here placeholder
    res.json({ verified: true });
  } catch (e) { next(e); }
};

const disable = async (req, res, next) => {
  try {
    const uid = currentUserId(req); if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
    const { code } = req.body || {};
    const result = await pool.query('SELECT two_factor_secret FROM users WHERE id=$1', [uid]);
    const secret = result.rows[0]?.two_factor_secret;
    if (!secret) return res.status(204).send();
    const valid = authenticator.verify({ token: code, secret });
    if (!valid) throw new HttpError(400, 'Invalid code', 'INVALID_CODE');
    await pool.query('UPDATE users SET two_factor_enabled=FALSE, two_factor_secret=NULL WHERE id=$1', [uid]);
    res.status(204).send();
  } catch (e) { next(e); }
};

module.exports = { setup, enable, verify, disable };