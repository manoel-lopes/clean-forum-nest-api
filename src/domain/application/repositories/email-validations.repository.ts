import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'

export type UpdateEmailValidationData = {
  where: { id: string }
  data: Partial<Omit<EmailValidation, 'id' | 'createdAt' | 'updatedAt'>>
}

export type EmailValidationsRepository = {
  create(emailValidation: EmailValidationProps): Promise<EmailValidation>
  update(emailValidation: UpdateEmailValidationData): Promise<EmailValidation>
  findByEmail(email: string): Promise<EmailValidation | null>
  findById(id: string): Promise<EmailValidation | null>
  delete(id: string): Promise<void>
}
