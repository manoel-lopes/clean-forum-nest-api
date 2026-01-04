import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailValidationCode } from '@/domain/enterprise/value-objects/email-validation-code/email-validation-code.vo'
import { InvalidValidationCodeError } from '@/domain/enterprise/value-objects/email-validation-code/errors/invalid-validation-code.error'
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
    try {
      const code = EmailValidationCode.validate(codeValue)
      if (emailValidation.code !== code.value) {
        throw new InvalidCodeError()
      }
    } catch (error) {
      if (error instanceof InvalidValidationCodeError) {
        throw new InvalidCodeError()
      }
      throw error
    }
    await this.emailValidationsRepository.update({
      where: { id: emailValidation.id },
      data: {
        isVerified: true,
      },
    })
  }
}
