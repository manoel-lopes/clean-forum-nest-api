import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { refreshTokens } from '@/infra/persistence/drizzle/schema'

@Injectable()
export class DrizzleRefreshTokensRepository implements RefreshTokensRepository {
  constructor (private readonly drizzle: DrizzleService) {}

  async create (data: RefreshTokenProps): Promise<RefreshToken> {
    const [token] = await this.drizzle.db
      .insert(refreshTokens)
      .values(data)
      .returning()
    return token
  }

  async findById (id: string): Promise<RefreshToken | null> {
    const [token] = await this.drizzle.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id))
      .limit(1)
    return token ?? null
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    const [token] = await this.drizzle.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .limit(1)
    return token ?? null
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    await this.drizzle.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
  }
}
