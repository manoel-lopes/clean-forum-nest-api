import type { FastifyReply, FastifyRequest } from 'fastify'
import { HttpException } from '@nestjs/common'

export abstract class FallbackController {
  static handle (error: Error, _req: FastifyRequest, res: FastifyReply) {
    if (error instanceof HttpException) {
      const statusCode = error.getStatus()
      const message = error.getResponse()
      return res.code(statusCode).send({ statusCode, message })
    }
    // TODO: send error to a error tracking service like Sentry, Honeycomb, etc.
    return res.code(500).send({
      statusCode: 500,
      message: 'Internal Server Error',
    })
  }
}
