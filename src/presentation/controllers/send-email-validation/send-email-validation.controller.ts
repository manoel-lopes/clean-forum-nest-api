import {
  Body,
  Controller,
  HttpCode,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SendEmailValidationError } from '@/domain/application/usecases/send-email-validation/errors/send-email-validation.exception'
import { SendEmailValidationUseCase } from '@/domain/application/usecases/send-email-validation/send-email-validation.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type SendEmailValidationBody,
  sendEmailValidationBodySchema,
} from '@/infra/validation/schemas/presentation/users/send-email-validation.schema'

@ApiTags('Users')
@Controller('email-validation/send')
export class SendEmailValidationController {
  constructor (private readonly sendEmailValidationUseCase: SendEmailValidationUseCase) {}

  @Public()
  @Post()
  @HttpCode(204)
  async handle (@Body(new ZodValidationPipe(sendEmailValidationBodySchema)) body: SendEmailValidationBody) {
    try {
      await this.sendEmailValidationUseCase.execute({ email: body.email })
    } catch (error) {
      if (error instanceof SendEmailValidationError) {
        throw new ServiceUnavailableException(error.message)
      }
      throw error
    }
  }
}
