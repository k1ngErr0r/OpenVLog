const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.middleware');
const { vulnerabilitiesPdf } = require('../controllers/report.controller');

router.post('/vulnerabilities/pdf', authenticateToken, vulnerabilitiesPdf);

module.exports = router;