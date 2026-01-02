export class InvalidCodeError extends Error {
  constructor () {
    super('The code is invalid')
  }
}
