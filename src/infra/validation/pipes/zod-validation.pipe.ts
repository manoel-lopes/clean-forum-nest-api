import { z } from 'zod'
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ZodErrorMapper } from '../config/zod-error-mapper'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor (private schema: z.ZodSchema) {}

  transform (value: unknown, _metadata: ArgumentMetadata) {
    try {
      ZodErrorMapper.setErrorMap()
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues[0]?.message || 'Validation failed'
        const isRequiredError = message.includes('required')
        if (isRequiredError) {
          throw new BadRequestException(message)
        }
        throw new UnprocessableEntityException(message)
      }
      throw error
    }
  }
}
