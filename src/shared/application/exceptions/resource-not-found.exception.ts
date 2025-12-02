type Resource = 'User' | 'Answer' | 'Question' | 'Comment' | 'Refresh token' | 'Email validation' | 'Attachment'

export class ResourceNotFoundException extends Error {
  constructor (resource: Resource) {
    super(`${resource} not found`)
  }
}
