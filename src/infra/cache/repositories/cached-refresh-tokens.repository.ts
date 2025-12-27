import { Inject, Injectable } from '@nestjs/common'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmRefreshTokensRepositoryToken = Symbol('TypeOrmRefreshTokensRepositoryToken')

@Injectable()
export class CachedRefreshTokensRepository
  extends BaseCachedRepository
  implements RefreshTokensRepository {
  private readonly userIdToTokenId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmRefreshTokensRepositoryToken)
    private readonly refreshTokensRepository: RefreshTokensRepository
  ) {
    super(cacheService)
  }

  async save (refreshToken: RefreshToken): Promise<void> {
    await this.refreshTokensRepository.save(refreshToken)
    this.userIdToTokenId.set(refreshToken.userId, refreshToken.id)
    await Promise.all([
      this.setCache(this.getRefreshTokenCacheKey(refreshToken.id), refreshToken, CacheTTL.REFRESH_TOKEN),
      this.setCache(this.getRefreshTokenByUserCacheKey(refreshToken.userId), refreshToken, CacheTTL.REFRESH_TOKEN),
    ])
  }

  async findById (id: string): Promise<RefreshToken | null> {
    const cacheKey = this.getRefreshTokenCacheKey(id)
    const cached = await this.getFromCache<RefreshToken>(cacheKey)
    if (cached) {
      this.userIdToTokenId.set(cached.userId, cached.id)
      return cached
    }
    const token = await this.refreshTokensRepository.findById(id)
    if (token) {
      this.userIdToTokenId.set(token.userId, token.id)
      await this.setCache(cacheKey, token, CacheTTL.REFRESH_TOKEN)
    }
    return token
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    const cacheKey = this.getRefreshTokenByUserCacheKey(userId)
    const cached = await this.getFromCache<RefreshToken>(cacheKey)
    if (cached) {
      this.userIdToTokenId.set(cached.userId, cached.id)
      return cached
    }
    const token = await this.refreshTokensRepository.findByUserId(userId)
    if (token) {
      this.userIdToTokenId.set(token.userId, token.id)
      await this.setCache(cacheKey, token, CacheTTL.REFRESH_TOKEN)
    }
    return token
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    const tokenId = this.userIdToTokenId.get(userId)
    await this.refreshTokensRepository.deleteManyByUserId(userId)
    const invalidations: Promise<void>[] = [
      this.invalidateCache(this.getRefreshTokenByUserCacheKey(userId)),
    ]
    if (tokenId) {
      invalidations.push(this.invalidateCache(this.getRefreshTokenCacheKey(tokenId)))
    }
    await Promise.all(invalidations)
    this.userIdToTokenId.delete(userId)
  }

  private getRefreshTokenCacheKey (id: string): string {
    return `refresh-token:${id}`
  }

  private getRefreshTokenByUserCacheKey (userId: string): string {
    return `refresh-token:user:${userId}`
  }
}
