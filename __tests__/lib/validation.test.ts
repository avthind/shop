import {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateCity,
  validateZipCode,
  validatePhone,
  validateNumber,
  sanitizeString,
  sanitizeHTML,
  sanitizeEmail,
  sanitizeName,
  sanitizeAddress,
  sanitizePhone,
  validateFormData,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return valid for correct email', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true });
    });

    it('should return invalid for empty email', () => {
      expect(validateEmail('')).toEqual({
        isValid: false,
        error: 'Email is required',
      });
    });

    it('should return invalid for email without @', () => {
      expect(validateEmail('testexample.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
    });

    it('should return invalid for email without domain', () => {
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
    });

    it('should return invalid for email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toEqual({
        isValid: false,
        error: 'Email address is too long',
      });
    });

    it('should trim whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toEqual({ isValid: true });
    });
  });

  describe('validatePassword', () => {
    it('should return valid for password with default min length', () => {
      expect(validatePassword('password123')).toEqual({ isValid: true });
    });

    it('should return invalid for empty password', () => {
      expect(validatePassword('')).toEqual({
        isValid: false,
        error: 'Password is required',
      });
    });

    it('should return invalid for password shorter than min length', () => {
      expect(validatePassword('short')).toEqual({
        isValid: false,
        error: 'Password must be at least 8 characters long',
      });
    });

    it('should respect custom min length', () => {
      expect(validatePassword('short', 10)).toEqual({
        isValid: false,
        error: 'Password must be at least 10 characters long',
      });
    });
  });

  describe('validateName', () => {
    it('should return valid for correct name', () => {
      expect(validateName('John Doe')).toEqual({ isValid: true });
    });

    it('should return invalid for empty name', () => {
      expect(validateName('')).toEqual({
        isValid: false,
        error: 'Name is required',
      });
    });

    it('should return invalid for name shorter than 2 characters', () => {
      expect(validateName('J')).toEqual({
        isValid: false,
        error: 'Name must be at least 2 characters long',
      });
    });

    it('should return invalid for name longer than 100 characters', () => {
      expect(validateName('a'.repeat(101))).toEqual({
        isValid: false,
        error: 'Name is too long',
      });
    });

    it('should return invalid for name with dangerous characters', () => {
      expect(validateName('John<script>')).toEqual({
        isValid: false,
        error: 'Name contains invalid characters',
      });
    });

    it('should use custom field name in error', () => {
      expect(validateName('', 'First Name')).toEqual({
        isValid: false,
        error: 'First Name is required',
      });
    });
  });

  describe('validateAddress', () => {
    it('should return valid for correct address', () => {
      expect(validateAddress('123 Main Street')).toEqual({ isValid: true });
    });

    it('should return invalid for empty address', () => {
      expect(validateAddress('')).toEqual({
        isValid: false,
        error: 'Address is required',
      });
    });

    it('should return invalid for address shorter than 5 characters', () => {
      expect(validateAddress('123')).toEqual({
        isValid: false,
        error: 'Address must be at least 5 characters long',
      });
    });

    it('should return invalid for address longer than 200 characters', () => {
      expect(validateAddress('a'.repeat(201))).toEqual({
        isValid: false,
        error: 'Address is too long',
      });
    });
  });

  describe('validateCity', () => {
    it('should return valid for correct city', () => {
      expect(validateCity('New York')).toEqual({ isValid: true });
    });

    it('should return invalid for empty city', () => {
      expect(validateCity('')).toEqual({
        isValid: false,
        error: 'City is required',
      });
    });

    it('should return invalid for city shorter than 2 characters', () => {
      expect(validateCity('N')).toEqual({
        isValid: false,
        error: 'City must be at least 2 characters long',
      });
    });
  });

  describe('validateZipCode', () => {
    it('should return valid for US ZIP code', () => {
      expect(validateZipCode('12345')).toEqual({ isValid: true });
      expect(validateZipCode('12345-6789')).toEqual({ isValid: true });
    });

    it('should return invalid for empty ZIP code', () => {
      expect(validateZipCode('')).toEqual({
        isValid: false,
        error: 'ZIP code is required',
      });
    });

    it('should return invalid for invalid US ZIP code', () => {
      expect(validateZipCode('1234')).toEqual({
        isValid: false,
        error: 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)',
      });
    });

    it('should validate UK postcode', () => {
      expect(validateZipCode('SW1A 1AA', 'UK')).toEqual({ isValid: true });
      expect(validateZipCode('SW1A1AA', 'UK')).toEqual({ isValid: true });
    });
  });

  describe('validatePhone', () => {
    it('should return valid for empty phone (optional)', () => {
      expect(validatePhone('')).toEqual({ isValid: true });
    });

    it('should return valid for correct phone number', () => {
      expect(validatePhone('1234567890')).toEqual({ isValid: true });
      expect(validatePhone('(123) 456-7890')).toEqual({ isValid: true });
      expect(validatePhone('+1 123-456-7890')).toEqual({ isValid: true });
    });

    it('should return invalid for invalid phone number', () => {
      expect(validatePhone('123')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number',
      });
    });
  });

  describe('validateNumber', () => {
    it('should return valid for correct number', () => {
      expect(validateNumber('123')).toEqual({ isValid: true });
    });

    it('should return invalid for empty value', () => {
      expect(validateNumber('')).toEqual({
        isValid: false,
        error: 'This field is required',
      });
    });

    it('should return invalid for non-numeric value', () => {
      expect(validateNumber('abc')).toEqual({
        isValid: false,
        error: 'Please enter a valid number',
      });
    });

    it('should validate min value', () => {
      expect(validateNumber('5', 10)).toEqual({
        isValid: false,
        error: 'Value must be at least 10',
      });
    });

    it('should validate max value', () => {
      expect(validateNumber('15', undefined, 10)).toEqual({
        isValid: false,
        error: 'Value must be at most 10',
      });
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should remove null bytes', () => {
      expect(sanitizeString('test\0string')).toBe('teststring');
    });

    it('should remove control characters', () => {
      expect(sanitizeString('test\x00\x01string')).toBe('teststring');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>Hello')).toBe('Hello');
    });

    it('should remove event handlers', () => {
      const result = sanitizeHTML('<div onclick="alert(1)">Test</div>');
      // The result may have a space after removing the attribute
      expect(result.replace(/\s+/g, ' ').trim()).toContain('<div');
      expect(result).toContain('Test</div>');
      expect(result).not.toContain('onclick');
    });
  });

  describe('sanitizeEmail', () => {
    it('should trim and lowercase email', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
    });
  });

  describe('sanitizeName', () => {
    it('should trim and capitalize name', () => {
      expect(sanitizeName('  john doe  ')).toBe('John Doe');
    });

    it('should handle multiple spaces', () => {
      expect(sanitizeName('john    doe')).toBe('John Doe');
    });
  });

  describe('sanitizeAddress', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeAddress('  123   main   st  ')).toBe('123 main st');
    });
  });

  describe('sanitizePhone', () => {
    it('should remove non-digit characters', () => {
      expect(sanitizePhone('(123) 456-7890')).toBe('1234567890');
    });

    it('should preserve leading +', () => {
      expect(sanitizePhone('+1 (123) 456-7890')).toBe('+11234567890');
    });
  });

  describe('validateFormData', () => {
    it('should validate all fields correctly', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      const rules = {
        email: (value: string) => validateEmail(value),
        password: (value: string) => validatePassword(value),
        name: (value: string) => validateName(value),
      };

      const result = validateFormData(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid fields', () => {
      const data = {
        email: 'invalid-email',
        password: 'short',
        name: '',
      };

      const rules = {
        email: (value: string) => validateEmail(value),
        password: (value: string) => validatePassword(value),
        name: (value: string) => validateName(value),
      };

      const result = validateFormData(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('password');
      expect(result.errors).toHaveProperty('name');
    });
  });
});
