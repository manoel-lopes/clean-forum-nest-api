import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { EmailValidation } from '@/domain/enterprise/entities/email-validation/email-validation.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmEmailValidationsRepository
  extends BaseTypeOrmRepository<EmailValidation>
  implements EmailValidationsRepository {
  constructor (@InjectRepository(EmailValidation) repository: Repository<EmailValidation>) {
    super(repository)
  }

  async update ({ emailValidationId, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    const updated = await this.updateOne({ id: emailValidationId, ...data })
    return updated
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    return this.findOne({ where: { email } })
  }
}
