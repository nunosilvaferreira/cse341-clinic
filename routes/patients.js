const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patients');
const validation = require('../middleware/validation');
const { isAuthenticated, isOwnerOrAdmin, sanitizeInputs, requireRole } = require('../middleware/auth');

/**
 * Patient Routes
 * All routes require authentication
 */

// Apply authentication and sanitization to all patient routes
router.use(isAuthenticated);
router.use(sanitizeInputs);

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     description: Retrieve a list of all patients (admin and psychologists only)
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of patients per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', patientController.getAllPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Retrieve a specific patient by their ID
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\d]{24}$'
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', isOwnerOrAdmin(), patientController.getPatientById);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     description: Create a new patient record in the system
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/', validation.validatePatient, patientController.createPatient);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient
 *     description: Update an existing patient's information
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\d]{24}$'
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', isOwnerOrAdmin(), validation.validatePatient, patientController.updatePatient);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     description: Delete a patient from the system (admin only)
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\d]{24}$'
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', requireRole(['admin']), patientController.deletePatient);

module.exports = router;