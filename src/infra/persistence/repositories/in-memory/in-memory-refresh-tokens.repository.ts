import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import type { RefreshToken } from '@/domain/enterprise/entities/refresh-token/refresh-token.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryRefreshTokensRepository extends BaseRepository<RefreshToken> implements RefreshTokensRepository {
  async findByUserId (userId: string): Promise<RefreshToken | null> {
    return this.findOneBy('userId', userId)
  }

  async deleteManyByUserId (userId: string) {
    await this.deleteManyBy('userId', userId)
  }
}
