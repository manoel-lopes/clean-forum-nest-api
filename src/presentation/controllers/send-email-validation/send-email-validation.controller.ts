import {
  Body,
  Controller,
  HttpCode,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common'
import { SendEmailValidationError } from '@/domain/application/usecases/send-email-validation/errors/send-email-validation.error'
import { SendEmailValidationUseCase } from '@/domain/application/usecases/send-email-validation/send-email-validation.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'

type SendEmailValidationBody = {
  email: string
}

@Controller('email-validation/send')
export class SendEmailValidationController {
  constructor (private readonly sendEmailValidationUseCase: SendEmailValidationUseCase) {}

  @Public()
  @Post()
  @HttpCode(204)
  async handle (@Body() body: SendEmailValidationBody) {
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
