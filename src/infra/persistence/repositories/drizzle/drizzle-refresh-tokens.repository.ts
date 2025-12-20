import { Injectable } from '@nestjs/common'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { refreshTokens } from '@/infra/persistence/drizzle/schema'
import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleRefreshTokensRepository
  extends BaseDrizzleRepository<typeof refreshTokens, RefreshToken, RefreshTokenProps>
  implements RefreshTokensRepository {
  constructor (drizzle: DrizzleService) {
    super(drizzle, refreshTokens)
  }

  async create (data: RefreshTokenProps): Promise<RefreshToken> {
    return this.save(data)
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    return this.findOne({ where: { userId } })
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    await this.deleteManyBy(refreshTokens.userId, userId)
  }
}
