export class EmailAlreadyVerifiedError extends Error {
  constructor () {
    super('This email has already been isVerified')
  }
}
