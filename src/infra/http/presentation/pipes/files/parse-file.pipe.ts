import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import type { UploadedFileData } from '@/infra/http/presentation/interceptors/fastify-file.interceptor'
import { FileValidator } from '@/infra/validation/ports/file-validator'

type ParseFilePipeOptions = {
  validators?: FileValidator[]
}

@Injectable()
export class ParseFilePipe implements PipeTransform<UploadedFileData> {
  private readonly validators: FileValidator[]

  constructor (options: ParseFilePipeOptions = {}) {
    this.validators = options.validators ?? []
  }

  async transform (value: UploadedFileData, _metadata: ArgumentMetadata): Promise<UploadedFileData> {
    for (const validator of this.validators) {
      const isValid = await validator.isValid(value)
      if (!isValid) throw new BadRequestException(validator.buildErrorMessage(value))
    }
    return value
  }
}
