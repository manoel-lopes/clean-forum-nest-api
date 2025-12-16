import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { EmailValidationEntity } from '@/infra/persistence/typeorm/entities/email-validation.entity'
import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmEmailValidationsRepository
  extends BaseTypeOrmRepository<EmailValidationEntity>
  implements EmailValidationsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(EmailValidationEntity, manager)
  }

  async create (data: EmailValidationProps): Promise<EmailValidation> {
    const entity = this.repository.create(data)
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    await this.repository.update(where.id, data)
    const updated = await this.repository.findOneOrFail({ where: { id: where.id } })
    return this.toDomain(updated)
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const entity = await this.repository.findOne({ where: { email } })
    return entity ? this.toDomain(entity) : null
  }

  async findById (id: string): Promise<EmailValidation | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  override async delete (id: string): Promise<void> {
    await this.repository.delete(id)
  }

  private toDomain (entity: EmailValidationEntity): EmailValidation {
    return {
      id: entity.id,
      email: entity.email,
      code: entity.code,
      expiresAt: entity.expiresAt,
      isVerified: entity.isVerified,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
