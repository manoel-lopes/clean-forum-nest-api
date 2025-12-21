import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailService } from '@/infra/adapters/email/ports/email-service'
import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { EmailValidationCode } from '@/domain/enterprise/value-objects/email-validation-code/email-validation-code.vo'
import { SendEmailValidationError } from './errors/send-email-validation.exception'

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
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)
      const existingValidation = await this.emailValidationsRepository.findByEmail(email)
      let code: string
      if (existingValidation) {
        const validationCode = EmailValidationCode.create()
        code = validationCode.value
        await this.emailValidationsRepository.update({
          emailValidationId: existingValidation.id,
          data: {
            code,
            expiresAt,
            isVerified: false,
          },
        })
      } else {
        const newValidation = EmailValidation.create({
          email,
          expiresAt,
          isVerified: false,
        })
        code = newValidation.code
        await this.emailValidationsRepository.save(newValidation)
      }
      await this.emailService.sendValidationCode(email, code)
    } catch (error) {
      throw new SendEmailValidationError(error.message)
    }
  }
}
