import { Global, Module } from '@nestjs/common'
import { EmailQueueModule } from '@/infra/queues/email/email.queue.module'
import { QueuedEmailService } from './queued-email-service'

export const EMAIL_SERVICE = Symbol('EmailService')

@Global()
@Module({
  imports: [EmailQueueModule],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: QueuedEmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
