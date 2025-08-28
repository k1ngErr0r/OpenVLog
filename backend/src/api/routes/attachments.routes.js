const express = require('express');
const router = express.Router();
const attachmentsController = require('../controllers/attachments.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/admin.middleware');

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: API for managing file attachments on vulnerabilities.
 */

// This router will be mounted at /api/attachments

/**
 * @swagger
 * /attachments/{attachmentId}/download:
 *   get:
 *     summary: Download a specific attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the attachment to download.
 *     responses:
 *       '200':
 *         description: The file to be downloaded.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Attachment not found.
 */
router.get('/:attachmentId/download', authenticateToken, attachmentsController.downloadAttachment);

/**
 * @swagger
 * /attachments/{attachmentId}:
 *   delete:
 *     summary: Delete an attachment (Admin only)
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the attachment to delete.
 *     responses:
 *       '204':
 *         description: No content, attachment deleted successfully.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '404':
 *         description: Attachment not found.
 */
router.delete('/:attachmentId', [authenticateToken, isAdmin], attachmentsController.deleteAttachment);

module.exports = router;
