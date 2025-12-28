import { Global, Module } from '@nestjs/common'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { LocalStorageService } from './implementations/local-storage-service'
import { S3StorageService } from './implementations/s3-storage-service'
import { StorageService } from './ports/storage-service'

@Global()
@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: StorageService,
      useFactory: (envService: EnvService) => {
        const nodeEnv = envService.get('NODE_ENV')
        if (nodeEnv === 'test') {
          return new LocalStorageService()
        }
        return new S3StorageService(envService)
      },
      inject: [EnvService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
