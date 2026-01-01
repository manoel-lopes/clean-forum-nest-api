import { FastifyError } from 'fastify'

export function isFastifyError (error: unknown): error is FastifyError {
  return error instanceof Error &&
    'statusCode' in error &&
    'code' in error
}
