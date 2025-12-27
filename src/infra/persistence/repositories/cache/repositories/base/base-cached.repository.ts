import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'

export abstract class BaseCachedRepository {
  constructor (protected readonly redis: RedisCacheService) {}

  protected async getFromCache<T> (key: string): Promise<T | null> {
    return this.redis.get<T>(key)
  }

  protected async setCache<T> (key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, ttlSeconds)
  }

  protected async invalidateCache (key: string): Promise<void> {
    await this.redis.delete(key)
  }

  protected async invalidateCachePattern (pattern: string): Promise<void> {
    await this.redis.deletePattern(pattern)
  }
}
