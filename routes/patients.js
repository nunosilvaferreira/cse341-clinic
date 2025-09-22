const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patients');
const validation = require('../middleware/validation');

// GET all patients
router.get('/', patientController.getAllPatients);

// GET single patient by ID
router.get('/:id', patientController.getPatientById);

// POST create new patient
router.post('/', validation.validatePatient, patientController.createPatient);

// PUT update patient
router.put('/:id', validation.validatePatient, patientController.updatePatient);

// DELETE patient
router.delete('/:id', patientController.deletePatient);

module.exports = router;