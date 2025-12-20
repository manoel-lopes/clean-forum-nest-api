import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { TypeOrmEmailValidationMapper } from '@/infra/persistence/mappers/typeorm/typeorm-email-validation.mapper'
import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmEmailValidationsRepository
  extends BaseTypeOrmRepository<EmailValidation>
  implements EmailValidationsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(EmailValidation, manager)
  }

  async save (emailValidation: EmailValidation): Promise<EmailValidation> {
    const saved = await this.repository.save(emailValidation)
    return TypeOrmEmailValidationMapper.toDomain(saved)
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    const updated = await this.repository.save({ id: where.id, ...data })
    return TypeOrmEmailValidationMapper.toDomain(updated)
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const emailValidation = await this.repository.findOne({ where: { email } })
    return emailValidation ? TypeOrmEmailValidationMapper.toDomain(emailValidation) : null
  }

  async findById (id: string): Promise<EmailValidation | null> {
    const emailValidation = await this.repository.findOne({ where: { id } })
    return emailValidation ? TypeOrmEmailValidationMapper.toDomain(emailValidation) : null
  }

  override async delete (id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
