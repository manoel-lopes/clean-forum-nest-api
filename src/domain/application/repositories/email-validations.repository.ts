import type { EmailValidation } from '@/domain/enterprise/entities/email-validation/email-validation.entity'

export type UpdateEmailValidationData = {
  emailValidationId: string
  data: Partial<Omit<EmailValidation, 'id' | 'createdAt' | 'updatedAt'>>
}

export type EmailValidationsRepository = {
  save(emailValidation: EmailValidation): Promise<void>
  update(emailValidation: UpdateEmailValidationData): Promise<EmailValidation>
  findByEmail(email: string): Promise<EmailValidation | null>
  findById(id: string): Promise<EmailValidation | null>
  delete(id: string): Promise<void>
}

export const EmailValidationsRepository = Symbol('EmailValidationsRepository')
