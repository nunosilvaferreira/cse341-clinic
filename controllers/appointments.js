const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Get all appointments
const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find().populate('patientId');
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

// Get appointments by patient ID
const getAppointmentsByPatient = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId }).populate('patientId');
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// Create new appointment
const createAppointment = async (req, res, next) => {
  try {
    // Check if patient exists
    const patient = await Patient.findById(req.body.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      psychologistId: req.body.psychologistId,
      appointmentDate: req.body.appointmentDate,
      status: { $ne: 'Cancelled' }
    });

    if (conflictingAppointment) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }

    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    await savedAppointment.populate('patientId');
    res.status(201).json(savedAppointment);
  } catch (error) {
    next(error);
  }
};

// Update appointment
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

// Delete appointment
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  deleteAppointment
};