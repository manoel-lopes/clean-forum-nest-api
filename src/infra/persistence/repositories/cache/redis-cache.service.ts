import Redis from 'ioredis'
import { Inject, Injectable } from '@nestjs/common'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')

@Injectable()
export class RedisCacheService {
  constructor (@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T> (key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    if (!data) return null
    const parsed: T = JSON.parse(data)
    return parsed
  }

  async set<T> (key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async delete (key: string): Promise<void> {
    await this.redis.del(key)
  }

  async deletePattern (pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
