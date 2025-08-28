const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { me } = require('../controllers/auth.controller.js');
const { authenticateToken } = require('../middleware/authenticate.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, me);

module.exports = router;
