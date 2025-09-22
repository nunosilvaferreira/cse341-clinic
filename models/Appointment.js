const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  psychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 120
  },
  appointmentType: {
    type: String,
    enum: ['Initial Consultation', 'Therapy Session', 'Follow-up', 'Crisis Intervention'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  symptoms: [String],
  treatmentPlan: {
    diagnosis: String,
    goals: [String],
    nextSteps: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);