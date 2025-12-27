import Redis from 'ioredis'
import { Global, Module } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import { REDIS_CLIENT, RedisCacheService } from './redis-cache.service'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (envService: EnvService) => {
        return new Redis({
          host: envService.get('REDIS_HOST'),
          port: envService.get('REDIS_PORT'),
        })
      },
      inject: [EnvService],
    },
    RedisCacheService,
  ],
  exports: [RedisCacheService],
})
export class CacheModule {}
