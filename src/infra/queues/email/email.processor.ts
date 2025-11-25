import { Job } from 'bullmq'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'

export interface EmailJob {
  to: string
  subject: string
  html: string
  code?: string
}

@Processor('emails', {
  concurrency: 10,
  limiter: {
    max: 100,
    duration: 60000,
  },
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name)

  async process (job: Job<EmailJob>): Promise<void> {
    const { to, subject, html } = job.data
    try {
      this.logger.log(`Simulating email send to ${to} with subject: ${subject}`)
      await this.simulateEmailSend(to, subject, html)
      this.logger.log(`Email sent successfully to ${to}`)
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  private async simulateEmailSend (_to: string, _subject: string, _html: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  @OnWorkerEvent('completed')
  onCompleted (job: Job<EmailJob>) {
    const duration = job.finishedOn ? job.finishedOn - (job.processedOn || 0) : 0
    this.logger.debug(`Email job ${job.id} completed in ${duration}ms`)
  }

  @OnWorkerEvent('failed')
  onFailed (job: Job<EmailJob>, error: Error) {
    this.logger.error(
      `Email job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`
    )
  }

  @OnWorkerEvent('error')
  onError (error: Error) {
    this.logger.error(`Worker error: ${error.message}`)
  }
}
