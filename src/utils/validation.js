// Comprehensive form validation utilities
import React from 'react';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports international formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Password strength validation
const PASSWORD_REGEX = {
  minLength: /.{6,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumbers: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

// Name validation (only letters, spaces, and hyphens)
const NAME_REGEX = /^[a-zA-Z\s\-]+$/;

// PIN code validation (6 digits)
const PINCODE_REGEX = /^\d{6}$/;

// Farm ID validation
const FARM_ID_REGEX = /^FM-\d{4}-[A-Z0-9]{3}$/;

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate password with strength requirements
 */
export const validatePassword = (password, requireStrong = false) => {
  const errors = [];
  const warnings = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings, strength: 'none' };
  }
  
  if (!PASSWORD_REGEX.minLength.test(password)) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (requireStrong) {
    if (!PASSWORD_REGEX.hasUpperCase.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!PASSWORD_REGEX.hasLowerCase.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!PASSWORD_REGEX.hasNumbers.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  // Calculate password strength
  let strength = 'weak';
  let strengthScore = 0;
  
  if (PASSWORD_REGEX.minLength.test(password)) strengthScore++;
  if (PASSWORD_REGEX.hasUpperCase.test(password)) strengthScore++;
  if (PASSWORD_REGEX.hasLowerCase.test(password)) strengthScore++;
  if (PASSWORD_REGEX.hasNumbers.test(password)) strengthScore++;
  if (PASSWORD_REGEX.hasSpecialChar.test(password)) strengthScore++;
  
  if (strengthScore >= 4) strength = 'strong';
  else if (strengthScore >= 2) strength = 'medium';
  
  // Add warnings for weak passwords
  if (!requireStrong && strength === 'weak') {
    warnings.push('Consider adding uppercase letters, numbers, or special characters for better security');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    strengthScore
  };
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate name fields
 */
export const validateName = (name, fieldName = 'Name', isRequired = true) => {
  const errors = [];
  
  if (!name || name.trim() === '') {
    if (isRequired) {
      errors.push(`${fieldName} is required`);
    }
  } else {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    } else if (trimmedName.length > 50) {
      errors.push(`${fieldName} must be less than 50 characters long`);
    } else if (!NAME_REGEX.test(trimmedName)) {
      errors.push(`${fieldName} can only contain letters, spaces, and hyphens`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone, isRequired = true) => {
  const errors = [];
  
  if (!phone || phone.trim() === '') {
    if (isRequired) {
      errors.push('Phone number is required');
    }
  } else {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove formatting
    
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push('Please enter a valid phone number');
    } else if (cleanPhone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    } else if (cleanPhone.length > 15) {
      errors.push('Phone number cannot exceed 15 digits');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate PIN code
 */
export const validatePincode = (pincode, isRequired = true) => {
  const errors = [];
  
  if (!pincode || pincode.trim() === '') {
    if (isRequired) {
      errors.push('PIN code is required');
    }
  } else if (!PINCODE_REGEX.test(pincode.trim())) {
    errors.push('PIN code must be exactly 6 digits');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate farm location
 */
export const validateFarmLocation = (location, isRequired = true) => {
  const errors = [];
  
  if (!location || location.trim() === '') {
    if (isRequired) {
      errors.push('Farm location is required');
    }
  } else {
    const trimmedLocation = location.trim();
    
    if (trimmedLocation.length < 3) {
      errors.push('Farm location must be at least 3 characters long');
    } else if (trimmedLocation.length > 100) {
      errors.push('Farm location must be less than 100 characters long');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate farm ID format
 */
export const validateFarmId = (farmId, isRequired = false) => {
  const errors = [];
  
  if (!farmId || farmId.trim() === '') {
    if (isRequired) {
      errors.push('Farm ID is required');
    }
  } else if (!FARM_ID_REGEX.test(farmId.trim())) {
    errors.push('Farm ID must be in format FM-YYYY-XXX (e.g., FM-2024-A1B)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate file upload
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    isRequired = true
  } = options;
  
  const errors = [];
  
  if (!file) {
    if (isRequired) {
      errors.push('File is required');
    }
    return { isValid: !isRequired, errors };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedTypesText = allowedTypes
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');
    errors.push(`File must be of type: ${allowedTypesText}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate entire form
 */
export const validateForm = (formData, validationRules) => {
  const fieldErrors = {};
  let isFormValid = true;
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const fieldValue = formData[fieldName];
    
    let fieldResult = { isValid: true, errors: [], warnings: [] };
    
    // Apply each validation rule for the field
    rules.forEach(rule => {
      const result = rule(fieldValue);
      
      if (!result.isValid) {
        fieldResult.isValid = false;
        fieldResult.errors.push(...result.errors);
      }
      
      if (result.warnings) {
        fieldResult.warnings.push(...result.warnings);
      }
    });
    
    if (!fieldResult.isValid) {
      isFormValid = false;
    }
    
    fieldErrors[fieldName] = fieldResult;
  });
  
  return {
    isValid: isFormValid,
    fieldErrors
  };
};

/**
 * Real-time validation hook for React components
 */
export const useFormValidation = (initialData, validationRules) => {
  const [formData, setFormData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const validateField = React.useCallback((fieldName, value) => {
    if (!validationRules[fieldName]) return { isValid: true, errors: [] };
    
    let result = { isValid: true, errors: [], warnings: [] };
    
    validationRules[fieldName].forEach(rule => {
      const fieldResult = rule(value);
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }
      if (fieldResult.warnings) {
        result.warnings.push(...fieldResult.warnings);
      }
    });
    
    return result;
  }, [validationRules]);
  
  const handleChange = React.useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Real-time validation only if field has been touched
    if (touched[fieldName]) {
      const fieldValidation = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldValidation
      }));
    }
  }, [touched, validateField]);
  
  const handleBlur = React.useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const fieldValidation = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldValidation
    }));
  }, [formData, validateField]);
  
  const validateAll = React.useCallback(() => {
    const validationResult = validateForm(formData, validationRules);
    setErrors(validationResult.fieldErrors);
    return validationResult.isValid;
  }, [formData, validationRules]);
  
  return {
    formData,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    setFormData,
    setErrors,
    setTouched
  };
};

// Export individual validators for use in components
export {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
  NAME_REGEX,
  PINCODE_REGEX,
  FARM_ID_REGEX
};