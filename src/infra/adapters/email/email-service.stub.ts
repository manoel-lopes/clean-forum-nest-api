import type { EmailService } from './ports/email-service'

export class EmailServiceStub implements EmailService {
  async sendValidationCode () {
    return Promise.resolve()
  }
}
