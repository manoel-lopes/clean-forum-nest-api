import type { UseCase } from '@/core/domain/application/use-case'
import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailValidationCode } from '@/domain/enterprise/entities/value-objects/email-validation-code/email-validation-code.vo'
import { EmailAlreadyVerifiedError } from './errors/email-already-verified.error'
import { EmailValidationNotFoundError } from './errors/email-validation-not-found.error'
import { ExpiredValidationCodeError } from './errors/expired-validation-code.error'
import { InvalidCodeError } from './errors/invalid-validation-code.error'

type VerifyEmailValidationRequest = {
  email: string
  code: string
}

export class VerifyEmailValidationUseCase implements UseCase {
  constructor (private readonly emailValidationsRepository: EmailValidationsRepository) {}

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
      where: { id: emailValidation.id },
      data: {
        isVerified: true,
      },
    })
  }
}
