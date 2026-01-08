import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { EmailValidationNotFoundError } from '@/domain/application/usecases/verify-email/errors/email-validation-not-found.error'
import { ExpiredValidationCodeError } from '@/domain/application/usecases/verify-email/errors/expired-validation-code.error'
import { InvalidCodeError } from '@/domain/application/usecases/verify-email/errors/invalid-validation-code.error'
import { VerifyEmailUseCase } from '@/domain/application/usecases/verify-email/verify-email.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/presentation/pipes/schemas/zod-validation.pipe'
import {
  VerifyEmailBodyDto,
  verifyEmailBodySchema,
} from './ports/verify-email.protocol'

@ApiTags('Users')
@Controller('email-validation/verify')
export class VerifyEmailController {
  constructor (private readonly verifyEmailUseCase: VerifyEmailUseCase) {}

  @Public()
  @Post()
  @HttpCode(204)
  @ApiOperation({ summary: 'Verify email validation code' })
  async handle (@Body(new ZodValidationPipe(verifyEmailBodySchema)) body: VerifyEmailBodyDto) {
    try {
      const { email, code } = body
      await this.verifyEmailUseCase.execute({ email, code })
    } catch (error) {
      if (error instanceof EmailValidationNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (
        error instanceof ExpiredValidationCodeError ||
        error instanceof InvalidCodeError
      ) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
