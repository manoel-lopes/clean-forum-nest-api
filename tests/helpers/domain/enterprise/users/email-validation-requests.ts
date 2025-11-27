import { PrismaHelper } from 'tests/helpers/infra/database/prisma-test-helper'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

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

export async function getLastEmailCodeForEmail (email: unknown): Promise<string | undefined> {
  return PrismaHelper.getLastEmailCodeForEmail(String(email))
}

export async function clearEmailCodes () {
  await PrismaHelper.cleanup()
}
