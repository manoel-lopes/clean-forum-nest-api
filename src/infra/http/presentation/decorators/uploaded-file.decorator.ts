import type { FastifyRequest } from 'fastify'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import {
  UPLOADED_FILE_KEY,
  UploadedFileData
} from '@/infra/http/presentation/interceptors/fastify-file.interceptor'

export const UploadedFile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UploadedFileData => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest
    & { [UPLOADED_FILE_KEY]: UploadedFileData }>()
    return request[UPLOADED_FILE_KEY]
  }
)
