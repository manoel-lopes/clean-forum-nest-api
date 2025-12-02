export class InvalidValidationCodeError extends Error {
  constructor (code: string) {
    super(`Invalid email validation code: ${code}. Code must be exactly 6 digits.`)
  }
}
