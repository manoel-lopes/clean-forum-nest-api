export class NotAuthorError extends Error {
  constructor (resource?: string) {
    super(resource ? `The user is not the author of the ${resource}` : 'You are not the author of this resource')
  }
}
