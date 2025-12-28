import { EmailValidationCode } from './email-validation-code.vo'
import { InvalidValidationCodeError } from './errors/invalid-validation-code.exception'

describe('EmailValidationCode', () => {
  it('should create a valid 6-digit code within range', () => {
    const code = EmailValidationCode.create()
    expect(code.value).toMatch(/^\d{6}$/)
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

  it('should validate boundary codes (min and max)', () => {
    const minCode = EmailValidationCode.validate('100000')
    const maxCode = EmailValidationCode.validate('999999')
    expect(minCode.value).toBe('100000')
    expect(maxCode.value).toBe('999999')
  })

  it('should throw error for wrong length codes', () => {
    expect(() => EmailValidationCode.validate('12345')).toThrow(InvalidValidationCodeError)
    expect(() => EmailValidationCode.validate('1234567')).toThrow(InvalidValidationCodeError)
  })

  it('should throw error for code below minimum range', () => {
    expect(() => EmailValidationCode.validate('099999')).toThrow(InvalidValidationCodeError)
  })

  it('should throw error for non-numeric characters', () => {
    expect(() => EmailValidationCode.validate('12345a')).toThrow(InvalidValidationCodeError)
    expect(() => EmailValidationCode.validate('a12345')).toThrow(InvalidValidationCodeError)
    expect(() => EmailValidationCode.validate('123456!')).toThrow(InvalidValidationCodeError)
  })

  it('should throw error for empty or whitespace', () => {
    expect(() => EmailValidationCode.validate('')).toThrow(InvalidValidationCodeError)
    expect(() => EmailValidationCode.validate(' 123456 ')).toThrow(InvalidValidationCodeError)
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
})
