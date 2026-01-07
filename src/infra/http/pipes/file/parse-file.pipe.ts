import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import type { UploadedFileData } from '@/infra/http/interceptors/fastify-file.interceptor'
import type { FileValidator } from '@/infra/validation/files/file-validator'

export type ParseFilePipeOptions = {
  validators?: FileValidator[]
  fileIsRequired?: boolean
}

@Injectable()
export class ParseFilePipe implements PipeTransform<UploadedFileData> {
  private readonly validators: FileValidator[]
  private readonly fileIsRequired: boolean

  constructor (options: ParseFilePipeOptions = {}) {
    this.validators = options.validators ?? []
    this.fileIsRequired = options.fileIsRequired ?? true
  }

  async transform (value: UploadedFileData, _metadata: ArgumentMetadata): Promise<UploadedFileData> {
    if (!value) {
      if (this.fileIsRequired) {
        throw new BadRequestException('File is required')
      }
      return value
    }

    for (const validator of this.validators) {
      const isValid = await validator.isValid(value)
      if (!isValid) {
        throw new BadRequestException(validator.buildErrorMessage(value))
      }
    }
    return value
  }
}
