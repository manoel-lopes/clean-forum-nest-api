import { map, Observable } from 'rxjs'
import type { FastifyReply } from 'fastify'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { HttpResponse } from '@/core/presentation/http-protocol'

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept (context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<FastifyReply>()
    return next.handle().pipe(
      map((data) => {
        if (this.isHttpResponse(data)) {
          const { statusCode, body } = data
          res.status(statusCode)
          return body
        }
        return data
      })
    )
  }

  private isHttpResponse (data: unknown): data is HttpResponse {
    return data !== null &&
      typeof data === 'object' &&
      'statusCode' in data &&
      typeof data.statusCode === 'number'
  }
}
