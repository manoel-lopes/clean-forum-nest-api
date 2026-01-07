import { Job } from 'bullmq'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { SendNotificationUseCase } from '@/domain/application/usecases/send-notification/send-notification.usecase'

export type NotificationJob = {
  recipientId: string
  title: string
  content: string
}

@Processor('notifications', {
  concurrency: 10,
  limiter: {
    max: 100,
    duration: 60000,
  },
})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor (private readonly sendNotificationUseCase: SendNotificationUseCase) {
    super()
  }

  async process (job: Job<NotificationJob>): Promise<void> {
    const { recipientId, title, content } = job.data
    try {
      await this.sendNotificationUseCase.execute({ recipientId, title, content })
      this.logger.log(`Notification sent to ${recipientId}`)
    } catch (error) {
      this.logger.error(
        `Failed to send notification to ${recipientId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  @OnWorkerEvent('completed')
  onCompleted (job: Job<NotificationJob>) {
    const duration = job.finishedOn ? job.finishedOn - (job.processedOn || 0) : 0
    this.logger.debug(`Notification job ${job.id} completed in ${duration}ms`)
  }

  @OnWorkerEvent('failed')
  onFailed (job: Job<NotificationJob>, error: Error) {
    this.logger.error(
      `Notification job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`
    )
  }

  @OnWorkerEvent('error')
  onError (error: Error) {
    this.logger.error(`Worker error: ${error.message}`)
  }
}
