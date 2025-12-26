import {
  Body,
  Controller,
  HttpCode,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SendEmailValidationError } from '@/domain/application/usecases/send-email-validation/errors/send-email-validation.exception'
import { SendEmailValidationUseCase } from '@/domain/application/usecases/send-email-validation/send-email-validation.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  SendEmailValidationBodyDto,
  sendEmailValidationBodySchema,
} from '@/infra/http/ports/users/send-email-validation.schema'

@ApiTags('Users')
@Controller('email-validation/send')
export class SendEmailValidationController {
  constructor (private readonly sendEmailValidationUseCase: SendEmailValidationUseCase) {}

  @Public()
  @Post()
  @HttpCode(204)
  @ApiOperation({ summary: 'Send email validation code' })
  async handle (@Body(new ZodValidationPipe(sendEmailValidationBodySchema)) body: SendEmailValidationBodyDto) {
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
