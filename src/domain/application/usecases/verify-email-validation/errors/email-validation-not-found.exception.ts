export class EmailValidationNotFoundError extends Error {
  constructor () {
    super('No email validation found for this email')
    this.name = 'EmailValidationNotFoundError'
  }
}
