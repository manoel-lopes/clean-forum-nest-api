import { eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { emailValidations } from '@/infra/persistence/drizzle/schema'
import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'

@Injectable()
export class DrizzleEmailValidationsRepository implements EmailValidationsRepository {
  constructor (private readonly drizzle: DrizzleService) {}

  async create (data: EmailValidationProps): Promise<EmailValidation> {
    const [validation] = await this.drizzle.db
      .insert(emailValidations)
      .values(data)
      .returning()
    return validation
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    const [updatedValidation] = await this.drizzle.db
      .update(emailValidations)
      .set(data)
      .where(eq(emailValidations.id, where.id))
      .returning()
    return updatedValidation
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const [validation] = await this.drizzle.db
      .select()
      .from(emailValidations)
      .where(eq(emailValidations.email, email))
      .limit(1)
    return validation ?? null
  }

  async findById (id: string): Promise<EmailValidation | null> {
    const [validation] = await this.drizzle.db
      .select()
      .from(emailValidations)
      .where(eq(emailValidations.id, id))
      .limit(1)
    return validation ?? null
  }

  async delete (id: string): Promise<void> {
    await this.drizzle.db.delete(emailValidations).where(eq(emailValidations.id, id))
  }
}
