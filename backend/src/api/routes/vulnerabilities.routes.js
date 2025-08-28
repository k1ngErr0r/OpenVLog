const express = require('express');
const router = express.Router();
const vulnerabilitiesController = require('../controllers/vulnerabilities.controller');
const commentsRoutes = require('./comments.routes');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/admin.middleware');
const vulnerabilityAttachmentsRoutes = require('./vulnerabilityAttachments.routes');

/**
 * @swagger
 * tags:
 *   name: Vulnerabilities
 *   description: API for managing vulnerabilities. Admins have full access, while regular users have read-only access.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Vulnerability:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the vulnerability.
 *         name:
 *           type: string
 *           description: The name or title of the vulnerability.
 *         severity:
 *           type: string
 *           enum: [Critical, High, Medium, Low, Informational]
 *           description: The severity level of the vulnerability.
 *         status:
 *           type: string
 *           enum: [Open, In Progress, Resolved, Closed]
 *           description: The current status of the vulnerability.
 *         description:
 *           type: string
 *           description: A detailed description of the vulnerability, its impact, and potential remediation.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the vulnerability was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the vulnerability was last updated.
 *     VulnerabilityInput:
 *       type: object
 *       required:
 *         - name
 *         - severity
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: The name or title of the vulnerability.
 *           example: "SQL Injection in login form"
 *         severity:
 *           type: string
 *           enum: [Critical, High, Medium, Low, Informational]
 *           description: The severity level of the vulnerability.
 *           example: "High"
 *         status:
 *           type: string
 *           enum: [Open, In Progress, Resolved, Closed]
 *           description: The current status of the vulnerability. Defaults to 'Open'.
 *           example: "Open"
 *         description:
 *           type: string
 *           description: A detailed description of the vulnerability.
 *           example: "The user login form is vulnerable to SQL injection via the 'username' parameter."
 */

/**
 * @swagger
 * /vulnerabilities:
 *   get:
 *     summary: Retrieve a list of vulnerabilities with optional filtering and pagination
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page.
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low, Informational]
 *         description: Filter vulnerabilities by severity.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In Progress, Resolved, Closed]
 *         description: Filter vulnerabilities by status.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search term for vulnerability name and description.
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter vulnerabilities reported on or after this date (YYYY-MM-DD)."
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter vulnerabilities reported on or before this date (YYYY-MM-DD)."
 *     responses:
 *       '200':
 *         description: A paginated list of vulnerabilities.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vulnerability'
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       '401':
 *         description: Unauthorized.
 */
router.get('/', authenticateToken, vulnerabilitiesController.getAllVulnerabilities);

/**
 * @swagger
 * /vulnerabilities/stats:
 *   get:
 *     summary: Get statistics about vulnerabilities for dashboard widgets
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An object containing vulnerability statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 severities:
 *                   type: object
 *                   description: A map of severity levels to their counts.
 *                   example: { "Critical": 5, "High": 10, "Medium": 20 }
 *                 statuses:
 *                   type: object
 *                   description: A map of status levels to their counts.
 *                   example: { "Open": 12, "In Progress": 8, "Resolved": 15 }
 *                 recent:
 *                   type: array
 *                   description: A list of the 5 most recently reported vulnerabilities.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       reported_at:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized.
 */
router.get('/stats', authenticateToken, vulnerabilitiesController.getVulnerabilityStats);

/**
 * @swagger
 * /vulnerabilities/export:
 *   get:
 *     summary: Export all vulnerabilities to CSV with optional filtering
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low, Informational]
 *         description: Filter vulnerabilities by severity.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In Progress, Resolved, Closed]
 *         description: Filter vulnerabilities by status.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search term for vulnerability name and description.
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter vulnerabilities reported on or after this date (YYYY-MM-DD)."
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter vulnerabilities reported on or before this date (YYYY-MM-DD)."
 *     responses:
 *       '200':
 *         description: A CSV file containing the filtered vulnerabilities.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized.
 */
router.get('/export', authenticateToken, vulnerabilitiesController.exportVulnerabilities);

/**
 * @swagger
 * /vulnerabilities/{id}:
 *   get:
 *     summary: Get a single vulnerability by ID
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the vulnerability to retrieve.
 *     responses:
 *       '200':
 *         description: The requested vulnerability.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vulnerability'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Vulnerability not found.
 */
router.get('/:id', authenticateToken, vulnerabilitiesController.getVulnerabilityById);

/**
 * @swagger
 * /vulnerabilities:
 *   post:
 *     summary: Add a new vulnerability (Admin only)
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VulnerabilityInput'
 *     responses:
 *       '201':
 *         description: Vulnerability created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vulnerability'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 */
router.post('/', [authenticateToken, isAdmin], vulnerabilitiesController.addVulnerability);

/**
 * @swagger
 * /vulnerabilities/{id}:
 *   put:
 *     summary: Update an existing vulnerability (Admin only)
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the vulnerability to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VulnerabilityInput'
 *     responses:
 *       '200':
 *         description: Vulnerability updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vulnerability'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '404':
 *         description: Vulnerability not found.
 */
router.put('/:id', [authenticateToken, isAdmin], vulnerabilitiesController.updateVulnerability);

/**
 * @swagger
 * /vulnerabilities/{id}:
 *   delete:
 *     summary: Delete a vulnerability (Admin only)
 *     tags: [Vulnerabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the vulnerability to delete.
 *     responses:
 *       '240':
 *         description: No content, vulnerability deleted successfully.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '404':
 *         description: Vulnerability not found.
 */
router.delete('/:id', [authenticateToken, isAdmin], vulnerabilitiesController.deleteVulnerability);

// Nested comments
router.use('/:vulnerabilityId/comments', commentsRoutes);

// Nested attachments
router.use('/:vulnerabilityId/attachments', vulnerabilityAttachmentsRoutes);

module.exports = router;
