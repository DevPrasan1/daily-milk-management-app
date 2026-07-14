import { describe, it, expect } from 'vitest'
import {
  validatePhone,
  validateOtp,
  validateName,
  validateQuantity,
  validatePrice
} from './validators'

describe('validators.js utilities', () => {
  describe('validatePhone', () => {
    it('should validate standard 10-digit phone numbers starting with 6-9', () => {
      expect(validatePhone('9876543210')).toBeNull()
      expect(validatePhone('6789012345')).toBeNull()
      expect(validatePhone('87654 32109')).toBeNull()
    })

    it('should fail if the phone number length is not 10 digits', () => {
      expect(validatePhone('12345')).toBe('Enter a valid 10-digit phone number')
      expect(validatePhone('98765432101')).toBe('Enter a valid 10-digit phone number')
    })

    it('should fail if the phone number does not start with 6, 7, 8, or 9', () => {
      expect(validatePhone('5876543210')).toBe('Phone number must start with 6, 7, 8, or 9')
      expect(validatePhone('0876543210')).toBe('Phone number must start with 6, 7, 8, or 9')
    })
  })

  describe('validateOtp', () => {
    it('should validate standard 6-digit numeric OTPs', () => {
      expect(validateOtp('123456')).toBeNull()
      expect(validateOtp('000000')).toBeNull()
    })

    it('should fail if the OTP is not exactly 6 characters', () => {
      expect(validateOtp('12345')).toBe('Enter the 6-digit OTP')
      expect(validateOtp('1234567')).toBe('Enter the 6-digit OTP')
    })

    it('should fail if the OTP contains non-digit characters', () => {
      expect(validateOtp('123a56')).toBe('OTP must be digits only')
      expect(validateOtp('123-56')).toBe('OTP must be digits only')
    })
  })

  describe('validateName', () => {
    it('should validate standard names between 2 and 50 characters', () => {
      expect(validateName('John Doe')).toBeNull()
      expect(validateName('A')).not.toBeNull() // < 2 characters
      expect(validateName('  John  ')).toBeNull()
    })

    it('should fail if the name is empty or less than 2 characters after trim', () => {
      expect(validateName('')).toBe('Name must be at least 2 characters')
      expect(validateName(' ')).toBe('Name must be at least 2 characters')
      expect(validateName('a')).toBe('Name must be at least 2 characters')
      expect(validateName(null)).toBe('Name must be at least 2 characters')
    })

    it('should fail if the name is longer than 50 characters', () => {
      const longName = 'a'.repeat(51)
      expect(validateName(longName)).toBe('Name is too long')
    })
  })

  describe('validateQuantity', () => {
    it('should validate valid quantities between 0 and 20', () => {
      expect(validateQuantity('10')).toBeNull()
      expect(validateQuantity(15.5)).toBeNull()
      expect(validateQuantity('0')).toBeNull()
    })

    it('should fail if quantity is not a valid number', () => {
      expect(validateQuantity('abc')).toBe('Enter a valid number')
      expect(validateQuantity('')).toBe('Enter a valid number')
    })

    it('should fail if quantity is negative', () => {
      expect(validateQuantity('-1')).toBe('Cannot be negative')
      expect(validateQuantity(-0.5)).toBe('Cannot be negative')
    })

    it('should fail if quantity is above 20L', () => {
      expect(validateQuantity('20.1')).toBe('Maximum 20L per session')
      expect(validateQuantity(21)).toBe('Maximum 20L per session')
    })
  })

  describe('validatePrice', () => {
    it('should validate valid price between 0 (exclusive) and 200', () => {
      expect(validatePrice('50')).toBeNull()
      expect(validatePrice(65.5)).toBeNull()
    })

    it('should fail if price is not a valid number or is <= 0', () => {
      expect(validatePrice('abc')).toBe('Enter a valid price')
      expect(validatePrice('0')).toBe('Enter a valid price')
      expect(validatePrice(-10)).toBe('Enter a valid price')
    })

    it('should fail if price is above 200', () => {
      expect(validatePrice('201')).toBe('Price seems too high')
      expect(validatePrice(250)).toBe('Price seems too high')
    })
  })
})
