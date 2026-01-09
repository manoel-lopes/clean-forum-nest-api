import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailService } from '@/infra/adapters/email/ports/email-service'
import { EmailValidationCode } from '@/domain/enterprise/value-objects/email-validation-code/email-validation-code.vo'
import { SendEmailValidationError } from './errors/send-email-validation.error'

type SendEmailValidationRequest = {
  email: string
}

@Injectable()
export class SendEmailValidationUseCase implements UseCase {
  constructor (
    @Inject(EmailValidationsRepository) private readonly emailValidationsRepository: EmailValidationsRepository,
    @Inject(EmailService) private readonly emailService: EmailService
  ) {}

  async execute ({ email }: SendEmailValidationRequest) {
    try {
      const code = EmailValidationCode.create()
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)
      const existingValidation = await this.emailValidationsRepository.findByEmail(email)
      if (existingValidation) {
        await this.emailValidationsRepository.update({
          emailValidationId: existingValidation.id,
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
