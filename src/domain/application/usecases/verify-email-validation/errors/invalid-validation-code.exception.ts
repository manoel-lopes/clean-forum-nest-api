export class InvalidCodeError extends Error {
  constructor (_code?: string) {
    super('Invalid validation code')
    this.name = 'InvalidCodeError'
  }
}
