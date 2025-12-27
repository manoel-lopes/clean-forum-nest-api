import { Inject, Injectable } from '@nestjs/common'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaRefreshTokensRepositoryToken = Symbol('PrismaRefreshTokensRepositoryToken')

@Injectable()
export class CachedRefreshTokensRepository
  extends BaseCachedRepository
  implements RefreshTokensRepository {
  private readonly cacheKeys = {
    refreshToken: (id: string) => `refresh-token:${id}`,
    refreshTokenByUser: (userId: string) => `refresh-token:user:${userId}`,
  }

  constructor (
    cacheService: RedisCacheService,
    @Inject(PrismaRefreshTokensRepositoryToken)
    private readonly refreshTokensRepository: RefreshTokensRepository
  ) {
    super(cacheService)
  }

  async create (refreshToken: RefreshTokenProps): Promise<RefreshToken> {
    const createdToken = await this.refreshTokensRepository.create(refreshToken)
    await this.setCache(this.cacheKeys.refreshToken(createdToken.id), createdToken, CacheTTL.REFRESH_TOKEN)
    await this.setCache(this.cacheKeys.refreshTokenByUser(createdToken.userId), createdToken, CacheTTL.REFRESH_TOKEN)
    return createdToken
  }

  async findById (id: string): Promise<RefreshToken | null> {
    const cacheKey = this.cacheKeys.refreshToken(id)
    const cached = await this.getFromCache<RefreshToken>(cacheKey)
    if (cached) return cached
    const token = await this.refreshTokensRepository.findById(id)
    if (token) await this.setCache(cacheKey, token, CacheTTL.REFRESH_TOKEN)
    return token
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    const cacheKey = this.cacheKeys.refreshTokenByUser(userId)
    const cached = await this.getFromCache<RefreshToken>(cacheKey)
    if (cached) return cached
    const token = await this.refreshTokensRepository.findByUserId(userId)
    if (token) await this.setCache(cacheKey, token, CacheTTL.REFRESH_TOKEN)
    return token
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    const token = await this.refreshTokensRepository.findByUserId(userId)
    await this.refreshTokensRepository.deleteManyByUserId(userId)
    await this.invalidateCache(this.cacheKeys.refreshTokenByUser(userId))
    if (token) await this.invalidateCache(this.cacheKeys.refreshToken(token.id))
  }
}
