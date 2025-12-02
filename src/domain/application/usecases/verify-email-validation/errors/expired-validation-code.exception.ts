export class ExpiredValidationCodeError extends Error {
  constructor () {
    super('Validation code has expired')
    this.name = 'ExpiredValidationCodeError'
  }
}
