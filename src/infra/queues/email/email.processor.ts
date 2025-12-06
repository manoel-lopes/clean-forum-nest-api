import { Job } from 'bullmq'
import { createTransport, type Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '@/infra/env/env'

export type EmailJob = {
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
export class EmailProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name)
  private readonly transporter: Transporter

  constructor (private readonly configService: ConfigService<Env, true>) {
    super()
    this.transporter = this.createTransporter()
  }

  private createTransporter (): Transporter {
    const nodeEnv = this.configService.get('NODE_ENV', { infer: true })
    const host = this.configService.get('EMAIL_HOST', { infer: true })
    const port = this.configService.get('EMAIL_PORT', { infer: true })
    const user = this.configService.get('EMAIL_USER', { infer: true })
    const pass = this.configService.get('EMAIL_PASS', { infer: true })
    if (nodeEnv === 'test') {
      return createTransport({
        streamTransport: true,
        newline: 'windows',
        buffer: true,
      })
    }
    const transportConfig: SMTPTransport.Options = {
      host,
      port,
      secure: false,
    }
    if (user && pass) {
      transportConfig.auth = { user, pass }
    }
    return createTransport(transportConfig)
  }

  async process (job: Job<EmailJob>): Promise<void> {
    const { to, subject, html } = job.data
    const from = this.configService.get('EMAIL_FROM', { infer: true })
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      })
      this.logger.log(`Email sent successfully to ${to}`)
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
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

  async onModuleDestroy () {
    await this.worker.close()
  }
}
