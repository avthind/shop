/**
 * Data validation and sanitization utilities
 * Provides functions to validate and sanitize user input
 */

// Validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check length
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
}

// Password validation
export function validatePassword(password: string, minLength: number = 8): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` };
  }

  // Optional: Add complexity requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // if (!hasUpperCase || !hasLowerCase || !hasNumber) {
  //   return { isValid: false, error: 'Password must contain uppercase, lowercase, and number' };
  // }

  return { isValid: true };
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} is too long` };
  }

  // Check for potentially malicious content
  const dangerousPatterns = /[<>{}[\]\\\/]/;
  if (dangerousPatterns.test(trimmed)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true };
}

// Address validation
export function validateAddress(address: string): ValidationResult {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Address is required' };
  }

  const trimmed = address.trim();
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Address must be at least 5 characters long' };
  }

  if (trimmed.length > 200) {
    return { isValid: false, error: 'Address is too long' };
  }

  return { isValid: true };
}

// City validation
export function validateCity(city: string): ValidationResult {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City is required' };
  }

  const trimmed = city.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'City must be at least 2 characters long' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'City name is too long' };
  }

  return { isValid: true };
}

// ZIP/Postal code validation
export function validateZipCode(zipCode: string, country: string = 'US'): ValidationResult {
  if (!zipCode || zipCode.trim() === '') {
    return { isValid: false, error: 'ZIP code is required' };
  }

  const trimmed = zipCode.trim();

  // US ZIP code validation
  if (country === 'US') {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    if (!usZipRegex.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)' };
    }
  }

  // UK postcode validation
  if (country === 'UK') {
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    if (!ukPostcodeRegex.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid UK postcode' };
    }
  }

  // Generic validation for other countries
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { isValid: false, error: 'ZIP code must be between 3 and 20 characters' };
  }

  return { isValid: true };
}

// Phone number validation (optional)
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Phone is optional
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
}

// Number validation
export function validateNumber(value: string, min?: number, max?: number): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'This field is required' };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }

  return { isValid: true };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

// Sanitize HTML (basic - for display purposes)
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  
  return sanitized;
}

// Sanitize email
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// Sanitize name
export function sanitizeName(name: string): string {
  if (!name) return '';
  let sanitized = name.trim();
  
  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Capitalize first letter of each word
  sanitized = sanitized.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return sanitized;
}

// Sanitize address
export function sanitizeAddress(address: string): string {
  if (!address) return '';
  let sanitized = address.trim();
  
  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
}

// Sanitize phone number
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters except + at the start
  let sanitized = phone.trim();
  sanitized = sanitized.replace(/[^\d+]/g, '');
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.slice(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }
  return sanitized;
}

// Validate form data object
export function validateFormData<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => ValidationResult>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field as keyof T]);
    if (!result.isValid) {
      errors[field as keyof T] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}
