import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { EmailAlreadyVerifiedError } from '@/domain/application/usecases/verify-email-validation/errors/email-already-verified.exception'
import { EmailValidationNotFoundError } from '@/domain/application/usecases/verify-email-validation/errors/email-validation-not-found.exception'
import { ExpiredValidationCodeError } from '@/domain/application/usecases/verify-email-validation/errors/expired-validation-code.exception'
import { InvalidCodeError } from '@/domain/application/usecases/verify-email-validation/errors/invalid-validation-code.exception'
import { VerifyEmailValidationUseCase } from '@/domain/application/usecases/verify-email-validation/verify-email-validation.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  VerifyEmailValidationBodyDto,
  verifyEmailValidationBodySchema,
} from './ports/verify-email-validation.protocol'

@ApiTags('Users')
@Controller('email-validation/verify')
export class VerifyEmailValidationController {
  constructor (private readonly verifyEmailValidationUseCase: VerifyEmailValidationUseCase) {}

  @Public()
  @Post()
  @HttpCode(204)
  @ApiOperation({ summary: 'Verify email validation code' })
  async handle (@Body(new ZodValidationPipe(verifyEmailValidationBodySchema)) body: VerifyEmailValidationBodyDto) {
    try {
      const { email, code } = body
      await this.verifyEmailValidationUseCase.execute({ email, code })
    } catch (error) {
      if (error instanceof EmailValidationNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof EmailAlreadyVerifiedError) {
        throw new BadRequestException(error.message)
      }
      if (error instanceof ExpiredValidationCodeError) {
        throw new BadRequestException(error.message)
      }
      if (error instanceof InvalidCodeError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
