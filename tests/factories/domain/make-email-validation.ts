import { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation/email-validation.entity'
import { faker } from '@faker-js/faker'

export function makeEmailValidation (override: Partial<EmailValidation> = {}): EmailValidation {
  const futureDate = new Date()
  futureDate.setMinutes(futureDate.getMinutes() + 10)
  const props: EmailValidationProps = {
    email: faker.internet.email(),
    expiresAt: futureDate,
    isVerified: false,
    ...override,
  }
  return EmailValidation.create(props)
}
