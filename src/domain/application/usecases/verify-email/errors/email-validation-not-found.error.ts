export class EmailValidationNotFoundError extends Error {
  constructor (email: string) {
    super(`No email validation found for the email: ${email}`)
  }
}
