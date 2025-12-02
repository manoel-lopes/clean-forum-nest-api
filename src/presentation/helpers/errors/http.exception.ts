export type HttpErrorType =
  | 'Bad Request'
  | 'Unauthorized'
  | 'Forbidden'
  | 'Not Found'
  | 'Conflict'
  | 'Unprocessable Entity'
  | 'Too Many Requests'
  | 'Service Unavailable'

export type HttpError = {
  readonly name: HttpErrorType
  readonly message?: string
}
