const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments');
const validation = require('../middleware/validation');

// GET all appointments
router.get('/', appointmentController.getAllAppointments);

// GET single appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// GET appointments by patient ID
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);

// POST create new appointment
router.post('/', validation.validateAppointment, appointmentController.createAppointment);

// PUT update appointment
router.put('/:id', validation.validateAppointment, appointmentController.updateAppointment);

// DELETE appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;