import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EmailAlreadyVerifiedError } from '@/domain/application/usecases/verify-email-validation/errors/email-already-verified.error'
import { EmailValidationNotFoundError } from '@/domain/application/usecases/verify-email-validation/errors/email-validation-not-found.error'
import { ExpiredValidationCodeError } from '@/domain/application/usecases/verify-email-validation/errors/expired-validation-code.error'
import { InvalidCodeError } from '@/domain/application/usecases/verify-email-validation/errors/invalid-validation-code.error'
import { VerifyEmailValidationUseCase } from '@/domain/application/usecases/verify-email-validation/verify-email-validation.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type VerifyEmailValidationBody,
  verifyEmailValidationBodySchema,
} from '@/infra/validation/schemas/presentation/users/verify-email-validation.schema'

@ApiTags('Users')
@Controller('email-validation/verify')
export class VerifyEmailValidationController {
  constructor (private readonly verifyEmailValidationUseCase: VerifyEmailValidationUseCase) {}

  @Public()
  @Post()
  @HttpCode(204)
  async handle (@Body(new ZodValidationPipe(verifyEmailValidationBodySchema)) body: VerifyEmailValidationBody) {
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
