const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { me } = require('../controllers/auth.controller.js');
// Correct path to auth middleware (was pointing to non-existent authenticate.js)
const { authenticateToken } = require('../../middleware/auth.middleware');
const authRateLimit = require('../../middleware/authRateLimit.middleware');

router.post('/register', authController.register);
router.post('/login', authRateLimit, authController.login);
router.post('/refresh', authRateLimit, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, me);
router.post('/request-password-reset', authRateLimit, authController.requestPasswordReset);
router.post('/reset-password', authRateLimit, authController.resetPassword);

module.exports = router;
