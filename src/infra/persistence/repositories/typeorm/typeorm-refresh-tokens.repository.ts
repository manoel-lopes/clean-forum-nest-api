import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { TypeOrmRefreshTokenMapper } from '@/infra/persistence/mappers/typeorm/typeorm-refresh-token.mapper'
import { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmRefreshTokensRepository
  extends BaseTypeOrmRepository<RefreshToken>
  implements RefreshTokensRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(RefreshToken, manager)
  }

  async save (refreshToken: RefreshToken): Promise<RefreshToken> {
    const saved = await this.repository.save(refreshToken)
    return TypeOrmRefreshTokenMapper.toDomain(saved)
  }

  async findById (id: string): Promise<RefreshToken | null> {
    const refreshToken = await this.repository.findOne({ where: { id } })
    return refreshToken ? TypeOrmRefreshTokenMapper.toDomain(refreshToken) : null
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    const refreshToken = await this.repository.findOne({ where: { userId } })
    return refreshToken ? TypeOrmRefreshTokenMapper.toDomain(refreshToken) : null
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    await this.repository.delete({ userId })
  }
}
