import type { EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'
import { faker } from '@faker-js/faker'

export function makeEmailValidationData (override: Partial<EmailValidationProps> = {}): EmailValidationProps {
  const futureDate = new Date()
  futureDate.setMinutes(futureDate.getMinutes() + 10)
  return {
    email: faker.internet.email(),
    code: faker.string.uuid(),
    expiresAt: futureDate,
    isVerified: false,
    ...override,
  }
}
