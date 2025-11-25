import { Global, Module } from '@nestjs/common'
import { EmailServiceStub } from './email-service.stub'

export const EMAIL_SERVICE = Symbol('EmailService')

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: EmailServiceStub,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
