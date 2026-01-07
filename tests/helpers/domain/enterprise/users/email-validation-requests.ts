import request from 'supertest'
import type { INestApplication } from '@nestjs/common'

type VerifyEmailData = {
  email?: unknown
  code?: unknown
}

export async function sendEmailValidation (app: INestApplication, { email }: { email: unknown }) {
  return await request(app.getHttpServer()).post('/email-validation/send').send({ email })
}

export async function verifyEmail (app: INestApplication, data: VerifyEmailData) {
  return await request(app.getHttpServer()).post('/email-validation/verify').send(data)
}
