export class NotRecipientError extends Error {
  constructor () {
    super('User is not the recipient of this notification')
  }
}
