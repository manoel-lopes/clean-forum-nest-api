import { RedisCacheService } from '@/infra/cache/redis-cache.service'

export abstract class BaseCachedRepository {
  constructor (protected readonly cacheService: RedisCacheService) {}

  protected async getFromCache<T> (key: string): Promise<T | null> {
    return this.cacheService.get<T>(key)
  }

  protected async setCache<T> (key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.cacheService.set(key, value, ttlSeconds)
  }

  protected async invalidateCache (key: string): Promise<void> {
    await this.cacheService.delete(key)
  }

  protected async invalidateCachePattern (pattern: string): Promise<void> {
    await this.cacheService.deletePattern(pattern)
  }
}
