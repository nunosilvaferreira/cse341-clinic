const Joi = require('joi');

// Validation schema for patient
const patientSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  dateOfBirth: Joi.date().max('now').required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow('')
  }),
  emergencyContact: Joi.object({
    name: Joi.string().allow(''),
    phone: Joi.string().allow(''),
    relationship: Joi.string().allow('')
  }),
  insuranceInfo: Joi.object({
    provider: Joi.string().allow(''),
    policyNumber: Joi.string().allow('')
  })
});

// Validation schema for appointment
const appointmentSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required(),
  psychologistId: Joi.string().hex().length(24).required(),
  appointmentDate: Joi.date().min('now').required(),
  duration: Joi.number().min(30).max(120).required(),
  appointmentType: Joi.string().valid(
    'Initial Consultation', 
    'Therapy Session', 
    'Follow-up', 
    'Crisis Intervention'
  ).required(),
  status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled', 'No-show'),
  notes: Joi.string().max(500).allow(''),
  symptoms: Joi.array().items(Joi.string()),
  treatmentPlan: Joi.object({
    diagnosis: Joi.string().allow(''),
    goals: Joi.array().items(Joi.string()),
    nextSteps: Joi.string().allow('')
  })
});

// Middleware to validate patient data
const validatePatient = (req, res, next) => {
  const { error } = patientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Middleware to validate appointment data
const validateAppointment = (req, res, next) => {
  const { error } = appointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  validatePatient,
  validateAppointment
};