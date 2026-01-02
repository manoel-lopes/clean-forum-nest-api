import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailValidationCode } from '@/domain/enterprise/value-objects/email-validation-code/email-validation-code.vo'
import { EmailValidationNotFoundError } from './errors/email-validation-not-found.error'
import { ExpiredValidationCodeError } from './errors/expired-validation-code.error'
import { InvalidCodeError } from './errors/invalid-validation-code.error'

type VerifyEmailRequest = {
  email: string
  code: string
}

@Injectable()
export class VerifyEmailUseCase implements UseCase {
  constructor (
    @Inject(EmailValidationsRepository) private readonly emailValidationsRepository: EmailValidationsRepository
  ) {}

  async execute (req: VerifyEmailRequest) {
    const { email, code: codeValue } = req
    const emailValidation = await this.emailValidationsRepository.findByEmail(email)
    if (!emailValidation) {
      throw new EmailValidationNotFoundError(email)
    }
    if (emailValidation.isVerified) return
    if (emailValidation.expiresAt < new Date()) {
      throw new ExpiredValidationCodeError()
    }
    const code = EmailValidationCode.validate(codeValue)
    if (emailValidation.code !== code.value) {
      throw new InvalidCodeError()
    }
    await this.emailValidationsRepository.update({
      emailValidationId: emailValidation.id,
      data: {
        isVerified: true,
      },
    })
  }
}
