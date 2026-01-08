import { Observable } from 'rxjs'
import type { FastifyRequest } from 'fastify'
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotAcceptableException,
  PayloadTooLargeException,
} from '@nestjs/common'
import { isFastifyError } from '@/infra/http/helpers/is-fastify-error'

export const UPLOADED_FILE_KEY = 'uploadedFile'

export type UploadedFileData = {
  filename: string
  mimetype: string
  buffer: Buffer
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor (private readonly fieldName: string = 'file') {}

  async intercept (context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    try {
      const file = await request.file()
      if (!file) {
        throw new BadRequestException('No file uploaded')
      }

      if (file.fieldname !== this.fieldName) {
        throw new BadRequestException(`Expected field name '${this.fieldName}', got '${file.fieldname}'`)
      }
      const buffer = await file.toBuffer()
      const uploadedFile: UploadedFileData = {
        filename: file.filename,
        mimetype: file.mimetype,
        buffer,
      }
      Object.assign(request, { [UPLOADED_FILE_KEY]: uploadedFile })
    } catch (error) {
      if (isFastifyError(error)) {
        const errorHandlers: Record<string, () => never> = {
          FST_INVALID_MULTIPART_CONTENT_TYPE: () => {
            throw new NotAcceptableException('Request is not multipart')
          },
          FST_REQ_FILE_TOO_LARGE: () => {
            throw new PayloadTooLargeException('File size exceeds the maximum allowed limit')
          },
        }
        const handler = errorHandlers[error.code]
        if (handler) {
          handler()
        }
      }
      throw error
    }
    return next.handle()
  }
}

export function FileInterceptor (fieldName: string = 'file'): new () => NestInterceptor {
  @Injectable()
  class MixinInterceptor extends FastifyFileInterceptor {
    constructor () {
      super(fieldName)
    }
  }
  return MixinInterceptor
}
