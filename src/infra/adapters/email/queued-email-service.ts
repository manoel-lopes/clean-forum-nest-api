import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Queue } from 'bullmq'
import handlebars, { type TemplateDelegate } from 'handlebars'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type { EmailJob } from '@/infra/queues/email/email.processor'
import type { EmailService } from './ports/email-service'

@Injectable()
export class QueuedEmailService implements EmailService {
  private template: TemplateDelegate

  constructor (
    @InjectQueue('emails')
    private readonly emailQueue: Queue<EmailJob>
  ) {}

  async sendValidationCode (email: string, code: string): Promise<void> {
    const template = await this.getTemplate()
    const html = template({ email, code })
    await this.emailQueue.add('send-email', {
      to: email,
      subject: 'Verify your email address',
      html,
      code,
    }, {
      priority: 1,
    })
  }

  private async getTemplate (): Promise<TemplateDelegate> {
    if (!this.template) {
      const templatePath = this.getPath()
      const templateContent = await readFile(templatePath, 'utf-8')
      this.template = handlebars.compile(templateContent)
    }
    return this.template
  }

  private getPath (): string {
    const paths = ['src', 'infra', 'adapters', 'email', 'templates', 'email-validation.hbs']
    return join(process.cwd(), ...paths)
  }
}
