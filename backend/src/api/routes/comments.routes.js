const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../../middleware/auth.middleware');
const commentsController = require('../controllers/comments.controller');

router.get('/', authenticateToken, commentsController.list);
router.post('/', authenticateToken, commentsController.add);

module.exports = router;
