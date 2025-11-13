import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import type { EmailService } from '@/infra/adapters/email/ports/email-service'
import { EmailValidationCode } from '@/domain/enterprise/entities/value-objects/email-validation-code/email-validation-code.vo'
import { SendEmailValidationError } from './errors/send-email-validation.error'

type SendEmailValidationRequest = {
  email: string
}

export class SendEmailValidationUseCase {
  constructor (
    private readonly emailValidationsRepository: EmailValidationsRepository,
    private readonly emailService: EmailService
  ) {}

  async execute ({ email }: SendEmailValidationRequest) {
    try {
      const code = EmailValidationCode.create()
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)
      const existingValidation = await this.emailValidationsRepository.findByEmail(email)
      if (existingValidation) {
        await this.emailValidationsRepository.update({
          where: { id: existingValidation.id },
          data: {
            code: code.value,
            expiresAt,
            isVerified: false,
          },
        })
      } else {
        await this.emailValidationsRepository.create({
          email,
          code: code.value,
          expiresAt,
          isVerified: false,
        })
      }
      await this.emailService.sendValidationCode(email, code.value)
    } catch (error) {
      throw new SendEmailValidationError(error.message)
    }
  }
}
