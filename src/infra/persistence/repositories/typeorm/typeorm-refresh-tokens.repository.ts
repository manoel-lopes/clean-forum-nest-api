import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { RefreshTokenEntity } from '@/infra/persistence/typeorm/entities/refresh-token.entity'
import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmRefreshTokensRepository
  extends BaseTypeOrmRepository<RefreshTokenEntity>
  implements RefreshTokensRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(RefreshTokenEntity, manager)
  }

  async create (data: RefreshTokenProps): Promise<RefreshToken> {
    const entity = this.repository.create(data)
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById (id: string): Promise<RefreshToken | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    const entity = await this.repository.findOne({ where: { userId } })
    return entity ? this.toDomain(entity) : null
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    await this.repository.delete({ userId })
  }

  private toDomain (entity: RefreshTokenEntity): RefreshToken {
    return {
      id: entity.id,
      userId: entity.userId,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
