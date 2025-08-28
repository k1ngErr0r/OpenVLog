const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setup.controller');

router.get('/status', setupController.checkStatus);
router.post('/initialize', setupController.initialize);

module.exports = router;