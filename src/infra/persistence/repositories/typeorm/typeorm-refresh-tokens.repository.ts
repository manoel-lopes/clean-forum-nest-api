import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmRefreshTokensRepository
  extends BaseTypeOrmRepository<RefreshToken>
  implements RefreshTokensRepository {
  constructor (@InjectRepository(RefreshToken) repository: Repository<RefreshToken>) {
    super(repository)
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    return this.findOne({ where: { userId } })
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    await this.deleteManyBy('userId', userId)
  }
}
