import request from 'supertest'
import type { INestApplication } from '@nestjs/common'

type VerifyEmailValidationData = {
  email?: unknown
  code?: unknown
}

export async function sendEmailValidation (app: INestApplication, { email }: { email: unknown }) {
  return await request(app.getHttpServer()).post('/email-validation/send').send({ email })
}

export async function verifyEmailValidation (app: INestApplication, data: VerifyEmailValidationData) {
  return await request(app.getHttpServer()).post('/email-validation/verify').send(data)
}
