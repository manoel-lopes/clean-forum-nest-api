import { EmailValidationCode } from './email-validation-code.vo'
import { InvalidValidationCodeError } from './errors/invalid-validation-code.exception'

describe('EmailValidationCode', () => {
  it('should create a valid 6-digit code', () => {
    const code = EmailValidationCode.create()
    expect(code.value).toMatch(/^\d{6}$/)
  })
  it('should create a code within valid range', () => {
    const code = EmailValidationCode.create()
    const numericValue = parseInt(code.value)
    expect(numericValue).toBeGreaterThanOrEqual(100000)
    expect(numericValue).toBeLessThanOrEqual(999999)
  })
  it('should create different codes on subsequent calls', () => {
    const code1 = EmailValidationCode.create()
    const code2 = EmailValidationCode.create()
    expect(code1.value).not.toBe(code2.value)
  })
  it('should validate a correct 6-digit code', () => {
    const code = EmailValidationCode.validate('123456')
    expect(code.value).toBe('123456')
  })
  it('should validate minimum valid code', () => {
    const code = EmailValidationCode.validate('100000')
    expect(code.value).toBe('100000')
  })
  it('should validate maximum valid code', () => {
    const code = EmailValidationCode.validate('999999')
    expect(code.value).toBe('999999')
  })
  it('should throw error for code with less than 6 digits', () => {
    expect(() => EmailValidationCode.validate('12345')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code with more than 6 digits', () => {
    expect(() => EmailValidationCode.validate('1234567')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code below minimum range', () => {
    expect(() => EmailValidationCode.validate('099999')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code above maximum range', () => {
    expect(() => EmailValidationCode.validate('1000000')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code with letters', () => {
    expect(() => EmailValidationCode.validate('12345a')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code with special characters', () => {
    expect(() => EmailValidationCode.validate('12345!')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code with spaces', () => {
    expect(() => EmailValidationCode.validate('123 456')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for empty string', () => {
    expect(() => EmailValidationCode.validate('')).toThrow(InvalidValidationCodeError)
  })
  it('should return true for equal codes', () => {
    const code1 = EmailValidationCode.validate('123456')
    const code2 = EmailValidationCode.validate('123456')
    expect(code1.equals(code2)).toBe(true)
  })
  it('should return false for different codes', () => {
    const code1 = EmailValidationCode.validate('123456')
    const code2 = EmailValidationCode.validate('654321')
    expect(code1.equals(code2)).toBe(false)
  })
  it('should work with created codes', () => {
    const code1 = EmailValidationCode.create()
    const code2 = EmailValidationCode.validate(code1.value)
    expect(code1.equals(code2)).toBe(true)
  })
  it('should handle code starting with zeros correctly', () => {
    const code = EmailValidationCode.validate('100000')
    expect(code.value).toBe('100000')
  })
  it('should throw error for code with leading zeros making it less than 6 digits visually', () => {
    expect(() => EmailValidationCode.validate('000123')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for negative numbers', () => {
    expect(() => EmailValidationCode.validate('-12345')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for decimal numbers', () => {
    expect(() => EmailValidationCode.validate('123.456')).toThrow(InvalidValidationCodeError)
  })
  it('should throw error for code with whitespace padding', () => {
    expect(() => EmailValidationCode.validate(' 123456 ')).toThrow(InvalidValidationCodeError)
  })
})
