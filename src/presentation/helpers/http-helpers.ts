import type { HttpResponse, HttpStatusCode } from '@/core/presentation/http-protocol'
import type { HttpError, HttpErrorType } from './errors/http.error'

export const ok = <T>(data: T): HttpResponse<T> => ({
  statusCode: 200,
  body: data,
})

export const created = <T>(data?: T): HttpResponse<T> => {
  if (!data) return { statusCode: 201 }
  return {
    statusCode: 201,
    body: data,
  }
}

export const noContent = (): HttpResponse => ({ statusCode: 204, body: null })

export const badRequest = (err: Error): HttpResponse => {
  return httpError({ name: 'Bad Request', message: err.message })
}

export const unauthorized = (err: Error): HttpResponse => {
  return httpError({ name: 'Unauthorized', message: err.message })
}

export const forbidden = (err: Error): HttpResponse => {
  return httpError({ name: 'Forbidden', message: err.message })
}

export const notFound = (err: Error): HttpResponse => {
  return httpError({ name: 'Not Found', message: err.message })
}

export const conflict = (err: Error): HttpResponse => {
  return httpError({ name: 'Conflict', message: err.message })
}

export const unprocessableEntity = (err: Error): HttpResponse => {
  return httpError({ name: 'Unprocessable Entity', message: err.message })
}

export const tooManyRequests = (err: Error): HttpResponse => {
  return httpError({ name: 'Too Many Requests', message: err.message })
}

export const serviceUnavailable = (err: Error): HttpResponse => {
  return httpError({ name: 'Service Unavailable', message: err.message })
}

export const serverError = (err: Error): HttpResponse => ({
  statusCode: 500,
  body: {
    error: 'Internal Server Error',
    message: err.message,
  },
})

const httpError = (err: HttpError): HttpResponse => {
  const statusCodeMapper: Record<HttpErrorType, HttpStatusCode> = {
    'Bad Request': 400,
    Unauthorized: 401,
    Forbidden: 403,
    'Not Found': 404,
    Conflict: 409,
    'Unprocessable Entity': 422,
    'Too Many Requests': 429,
    'Service Unavailable': 503,
  }
  return {
    statusCode: statusCodeMapper[err.name],
    body: {
      error: err.name,
      message: err.message,
    },
  }
}
