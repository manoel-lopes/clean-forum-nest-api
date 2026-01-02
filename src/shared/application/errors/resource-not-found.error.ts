type Resource = 'User'
| 'Answer'
| 'Question'
| 'Comment'
| 'Token'
| 'Refresh token'
| 'Email validation'
| 'Attachment'

export class ResourceNotFoundError extends Error {
  constructor (resource: Resource) {
    super(`${resource} not found`)
  }
}
