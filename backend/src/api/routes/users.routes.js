const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/admin.middleware');

router.get('/', [authenticateToken, isAdmin], usersController.getAllUsers);
router.post('/', [authenticateToken, isAdmin], usersController.addUser);
router.delete('/:id', [authenticateToken, isAdmin], usersController.deleteUser);

module.exports = router;
