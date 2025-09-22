// scripts/seedData.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Models - ATENÇÃO: ajusta os caminhos conforme a tua estrutura
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// Load data
const patientsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/patients.json'), 'utf8'));
const appointmentsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/appointments.json'), 'utf8'));

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert patients
    const patients = await Patient.insertMany(patientsData.patients);
    console.log(`👥 Inserted ${patients.length} patients`);

    // Insert appointments
    const appointments = await Appointment.insertMany(appointmentsData.appointments);
    console.log(`📅 Inserted ${appointments.length} appointments`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;