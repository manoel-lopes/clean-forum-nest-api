import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailValidationCode } from '@/domain/enterprise/value-objects/email-validation-code/email-validation-code.vo'
import { EmailAlreadyVerifiedError } from './errors/email-already-verified.exception'
import { EmailValidationNotFoundError } from './errors/email-validation-not-found.exception'
import { ExpiredValidationCodeError } from './errors/expired-validation-code.exception'
import { InvalidCodeError } from './errors/invalid-validation-code.exception'

type VerifyEmailValidationRequest = {
  email: string
  code: string
}

@Injectable()
export class VerifyEmailValidationUseCase implements UseCase {
  constructor (
    @Inject(EmailValidationsRepository) private readonly emailValidationsRepository: EmailValidationsRepository
  ) {}

  async execute (req: VerifyEmailValidationRequest) {
    const { email, code: codeValue } = req
    const emailValidation = await this.emailValidationsRepository.findByEmail(email)
    if (!emailValidation) {
      throw new EmailValidationNotFoundError()
    }
    if (emailValidation.isVerified) {
      throw new EmailAlreadyVerifiedError()
    }
    if (emailValidation.expiresAt < new Date()) {
      throw new ExpiredValidationCodeError()
    }
    const code = EmailValidationCode.validate(codeValue)
    if (emailValidation.code !== code.value) {
      throw new InvalidCodeError(codeValue)
    }
    await this.emailValidationsRepository.update({
      emailValidationId: emailValidation.id,
      data: {
        isVerified: true,
      },
    })
  }
}
