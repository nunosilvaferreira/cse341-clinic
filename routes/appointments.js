const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments');
const { validateAppointment } = require('../middleware/validation');
const { isAuthenticated, optionalAuth } = require('../middleware/auth');
const { sanitizeInputs } = require('../middleware/validation');

/**
 * Appointment Routes
 * Some routes are public, others require authentication
 */

// Apply sanitization to all appointment routes
router.use(sanitizeInputs);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Retrieve a list of appointments with optional filtering
 *     tags: [Appointments]
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
 *         description: Number of appointments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Scheduled, Completed, Cancelled, No-show, Rescheduled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments to this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/', optionalAuth, appointmentController.getAllAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     description: Retrieve a specific appointment by its ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\\d]{24}$'
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', optionalAuth, appointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments/patient/{patientId}:
 *   get:
 *     summary: Get appointments by patient ID
 *     description: Retrieve all appointments for a specific patient
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\\d]{24}$'
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.get('/patient/:patientId', isAuthenticated, appointmentController.getAppointmentsByPatient);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Schedule a new appointment for a patient
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Patient not found
 *       409:
 *         description: Time slot conflict
 *       500:
 *         description: Internal server error
 */
router.post('/', isAuthenticated, validateAppointment, appointmentController.createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     description: Update an existing appointment
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\\d]{24}$'
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Time slot conflict
 *       500:
 *         description: Internal server error
 */
router.put('/:id', isAuthenticated, validateAppointment, appointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     description: Cancel and delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\\d]{24}$'
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);

module.exports = router;
