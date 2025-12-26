import Redis from 'ioredis'
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly client: Redis

  constructor (private readonly envService: EnvService) {
    this.client = new Redis({
      host: this.envService.get('REDIS_HOST'),
      port: this.envService.get('REDIS_PORT'),
      db: this.envService.get('REDIS_DB'),
    })
  }

  async onModuleDestroy (): Promise<void> {
    await this.client.quit()
  }

  async get<T> (key: string): Promise<T | null> {
    const data = await this.client.get(key)
    if (!data) {
      return null
    }
    return JSON.parse(data) as T
  }

  async set<T> (key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized)
    } else {
      await this.client.set(key, serialized)
    }
  }

  async delete (key: string): Promise<void> {
    await this.client.del(key)
  }

  async deletePattern (pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern)
    if (keys.length > 0) {
      await this.client.del(...keys)
    }
  }

  async exists (key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }
}
