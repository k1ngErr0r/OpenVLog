const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing user notifications.
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An object containing a list of notifications and the total unread count.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       link:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 unreadCount:
 *                   type: integer
 *       '401':
 *         description: Unauthorized.
 */
router.get('/', authenticateToken, notificationsController.getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Mark all of the user's notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: No content, all notifications marked as read.
 *       '401':
 *         description: Unauthorized.
 */
router.post('/read-all', authenticateToken, notificationsController.markAllNotificationsAsRead);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   post:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the notification to mark as read.
 *     responses:
 *       '200':
 *         description: The updated notification object.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Notification not found.
 */
router.post('/:notificationId/read', authenticateToken, notificationsController.markNotificationAsRead);

module.exports = router;
