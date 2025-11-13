export class SendEmailValidationError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'SendEmailValidationError'
  }
}
