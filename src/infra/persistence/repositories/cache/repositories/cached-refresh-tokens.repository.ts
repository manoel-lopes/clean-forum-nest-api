import { Inject, Injectable } from '@nestjs/common'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaRefreshTokensRepositoryToken = Symbol('PrismaRefreshTokensRepositoryToken')

@Injectable()
export class CachedRefreshTokensRepository
  extends BaseCachedRepository
  implements RefreshTokensRepository {
  private readonly REFRESH_TOKENS_TTL = 86400
  private readonly userIdToTokenId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    @Inject(PrismaRefreshTokensRepositoryToken)
    private readonly refreshTokensRepository: RefreshTokensRepository
  ) {
    super(redis)
  }

  async create (refreshTokenData: RefreshTokenProps): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokensRepository.create(refreshTokenData)
    this.userIdToTokenId.set(refreshToken.userId, refreshToken.id)
    await this.setCache(this.getRefreshTokenCacheKey(refreshToken.id), refreshToken, this.REFRESH_TOKENS_TTL)
    await this.setCache(this.getRefreshTokenByUserCacheKey(refreshToken.userId), refreshToken, this.REFRESH_TOKENS_TTL)
    return refreshToken
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
      await this.setCache(cacheKey, token, this.REFRESH_TOKENS_TTL)
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
      await this.setCache(cacheKey, token, this.REFRESH_TOKENS_TTL)
    }
    return token
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    const tokenId = this.userIdToTokenId.get(userId)
    await this.refreshTokensRepository.deleteManyByUserId(userId)
    await this.invalidateCache(this.getRefreshTokenByUserCacheKey(userId))
    if (tokenId) await this.invalidateCache(this.getRefreshTokenCacheKey(tokenId))
    this.userIdToTokenId.delete(userId)
  }

  private getRefreshTokenCacheKey (id: string) {
    return `refresh-token:${id}`
  }

  private getRefreshTokenByUserCacheKey (userId: string) {
    return `refresh-token:user:${userId}`
  }
}
