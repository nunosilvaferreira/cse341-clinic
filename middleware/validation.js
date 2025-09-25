/**
 * Validation middleware without external dependencies
 * Provides input validation and sanitization for the Psychology Clinic API
 */

// Patient validation middleware
const validatePatient = (req, res, next) => {
  const { firstName, lastName, email, phone, dateOfBirth, gender } = req.body;
  
  const errors = [];
  
  // Required field validation
  if (!firstName || firstName.trim().length === 0) {
    errors.push('First name is required');
  } else if (firstName.length > 50) {
    errors.push('First name must be less than 50 characters');
  }
  
  if (!lastName || lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else if (lastName.length > 50) {
    errors.push('Last name must be less than 50 characters');
  }
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Valid email address is required');
  } else if (email.length > 100) {
    errors.push('Email must be less than 100 characters');
  }
  
  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (phone.length < 10) {
    errors.push('Phone number must be at least 10 characters');
  }
  
  if (!dateOfBirth || dateOfBirth.trim().length === 0) {
    errors.push('Date of birth is required');
  } else if (!isValidDate(dateOfBirth)) {
    errors.push('Valid date of birth is required (YYYY-MM-DD format)');
  }
  
  const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  if (!gender || gender.trim().length === 0) {
    errors.push('Gender is required');
  } else if (!validGenders.includes(gender)) {
    errors.push(`Gender must be one of: ${validGenders.join(', ')}`);
  }
  
  // Optional field validation
  if (req.body.address) {
    const { street, city, state, zipCode, country } = req.body.address;
    
    if (street && street.length > 100) {
      errors.push('Street address must be less than 100 characters');
    }
    
    if (city && city.length > 50) {
      errors.push('City must be less than 50 characters');
    }
    
    if (state && state.length > 50) {
      errors.push('State must be less than 50 characters');
    }
    
    if (zipCode && zipCode.length > 20) {
      errors.push('Zip code must be less than 20 characters');
    }
    
    if (country && country.length > 50) {
      errors.push('Country must be less than 50 characters');
    }
  }
  
  if (req.body.emergencyContact) {
    const { name, phone, relationship } = req.body.emergencyContact;
    
    if (name && name.length > 100) {
      errors.push('Emergency contact name must be less than 100 characters');
    }
    
    if (phone && phone.length < 10) {
      errors.push('Emergency contact phone must be at least 10 characters');
    }
    
    if (relationship && relationship.length > 50) {
      errors.push('Relationship must be less than 50 characters');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors
    });
  }
  
  next();
};

// Appointment validation middleware
const validateAppointment = (req, res, next) => {
  const { patientId, psychologistId, appointmentDate, duration, appointmentType } = req.body;
  
  const errors = [];
  
  if (!patientId || patientId.trim().length === 0) {
    errors.push('Patient ID is required');
  } else if (!isValidObjectId(patientId)) {
    errors.push('Valid Patient ID is required');
  }
  
  if (!psychologistId || psychologistId.trim().length === 0) {
    errors.push('Psychologist ID is required');
  } else if (!isValidObjectId(psychologistId)) {
    errors.push('Valid Psychologist ID is required');
  }
  
  if (!appointmentDate || appointmentDate.trim().length === 0) {
    errors.push('Appointment date is required');
  } else if (!isValidDate(appointmentDate)) {
    errors.push('Valid appointment date is required (ISO 8601 format)');
  } else if (new Date(appointmentDate) < new Date()) {
    errors.push('Appointment date cannot be in the past');
  }
  
  if (!duration || isNaN(duration)) {
    errors.push('Duration is required and must be a number');
  } else if (duration < 30 || duration > 120) {
    errors.push('Duration must be between 30 and 120 minutes');
  }
  
  const validAppointmentTypes = [
    'Initial Consultation', 
    'Therapy Session', 
    'Follow-up', 
    'Crisis Intervention', 
    'Assessment'
  ];
  
  if (!appointmentType || appointmentType.trim().length === 0) {
    errors.push('Appointment type is required');
  } else if (!validAppointmentTypes.includes(appointmentType)) {
    errors.push(`Appointment type must be one of: ${validAppointmentTypes.join(', ')}`);
  }
  
  // Optional status validation
  if (req.body.status) {
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'No-show', 'Rescheduled'];
    if (!validStatuses.includes(req.body.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }
  
  // Optional symptoms validation
  if (req.body.symptoms && Array.isArray(req.body.symptoms)) {
    req.body.symptoms.forEach((symptom, index) => {
      if (symptom.length > 100) {
        errors.push(`Symptom at position ${index + 1} must be less than 100 characters`);
      }
    });
  }
  
  // Optional notes validation
  if (req.body.notes && req.body.notes.length > 1000) {
    errors.push('Notes must be less than 1000 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your appointment data',
      details: errors
    });
  }
  
  next();
};

// User validation for registration (if needed)
const validateUser = (req, res, next) => {
  const { username, email, password } = req.body;
  
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Valid email address is required');
  }
  
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your user data',
      details: errors
    });
  }
  
  next();
};

// Input sanitization middleware
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      } else if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(item => 
          typeof item === 'string' ? sanitizeInput(item) : item
        );
      } else if (req.body[key] && typeof req.body[key] === 'object') {
        // Sanitize nested objects (like address, emergencyContact)
        Object.keys(req.body[key]).forEach(nestedKey => {
          if (typeof req.body[key][nestedKey] === 'string') {
            req.body[key][nestedKey] = sanitizeInput(req.body[key][nestedKey]);
          }
        });
      }
    });
  }
  next();
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.includes('-');
  } catch {
    return false;
  }
}

function isValidObjectId(id) {
  // Basic MongoDB ObjectId validation (24 hex characters)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Basic XSS protection - remove script tags and trim whitespace
    return input.trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>?/gm, '');
  }
  return input;
}

module.exports = {
  validatePatient,
  validateAppointment,
  validateUser,
  sanitizeInputs,
  isValidEmail,
  isValidDate,
  isValidObjectId
};