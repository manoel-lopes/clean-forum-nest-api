import { Global, Module } from '@nestjs/common'
import { EmailQueueModule } from '@/infra/queues/email/email.queue.module'
import { EmailService } from './ports/email-service'
import { QueuedEmailService } from './queued-email-service'

@Global()
@Module({
  imports: [EmailQueueModule],
  providers: [
    {
      provide: EmailService,
      useClass: QueuedEmailService,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
