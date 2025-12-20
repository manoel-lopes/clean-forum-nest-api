import { Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { emailValidations } from '@/infra/persistence/drizzle/schema'
import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleEmailValidationsRepository
  extends BaseDrizzleRepository<typeof emailValidations, EmailValidation, EmailValidationProps>
  implements EmailValidationsRepository {
  constructor (drizzle: DrizzleService) {
    super(drizzle, emailValidations)
  }

  async create (data: EmailValidationProps): Promise<EmailValidation> {
    return this.save(data)
  }

  async delete (id: string): Promise<void> {
    await this.deleteById(id)
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    return this.updateOne({ where, data })
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    return this.findOne({ where: { email } })
  }
}
