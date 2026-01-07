import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { NotificationProcessor } from './notification.processor'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  providers: [NotificationProcessor],
  exports: [BullModule],
})
export class NotificationQueueModule {}
