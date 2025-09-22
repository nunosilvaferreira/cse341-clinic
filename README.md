# Psychology Clinic Appointment System

A RESTful API for managing psychology clinic appointments and patient records.

## Features

- Patient management (CRUD operations)
- Appointment scheduling (CRUD operations)
- Data validation and error handling
- MongoDB integration
- API documentation with Swagger

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your MongoDB connection string
4. Start the server: `npm run dev`

## API Endpoints

### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Appointments
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get appointment by ID
- `GET /appointments/patient/:patientId` - Get appointments by patient
- `POST /appointments` - Create new appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

## API Documentation

Visit `/api-docs` after starting the server to view the Swagger documentation.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Joi for validation
- Swagger for documentation