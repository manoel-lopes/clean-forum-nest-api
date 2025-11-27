type Resource = 'question' | 'answer' | 'comment'

export class NotAuthorError extends Error {
  constructor (resource: Resource) {
    super(`The user is not the author of the ${resource}`)
  }
}
