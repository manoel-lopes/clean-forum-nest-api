export class ExpiredValidationCodeError extends Error {
  constructor () {
    super('The code has expired')
  }
}
