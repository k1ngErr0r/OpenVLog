const express = require('express');
const router = express.Router();
const vulnerabilitiesController = require('../controllers/vulnerabilities.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/admin.middleware');

router.get('/', authenticateToken, vulnerabilitiesController.getAllVulnerabilities);
router.get('/:id', authenticateToken, vulnerabilitiesController.getVulnerabilityById);
router.post('/', [authenticateToken, isAdmin], vulnerabilitiesController.addVulnerability);
router.put('/:id', [authenticateToken, isAdmin], vulnerabilitiesController.updateVulnerability);
router.delete('/:id', [authenticateToken, isAdmin], vulnerabilitiesController.deleteVulnerability);

module.exports = router;
