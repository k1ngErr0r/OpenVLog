const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.middleware');
const ctrl = require('../controllers/twofa.controller');

// GET secret + QR (not enabling yet)
router.get('/setup', authenticateToken, ctrl.setup);
// POST enable (secret + code)
router.post('/enable', authenticateToken, ctrl.enable);
// POST verify (placeholder second step) - in a full flow would use tempToken auth
router.post('/verify', authenticateToken, ctrl.verify);
// POST disable (requires current code)
router.post('/disable', authenticateToken, ctrl.disable);

module.exports = router;