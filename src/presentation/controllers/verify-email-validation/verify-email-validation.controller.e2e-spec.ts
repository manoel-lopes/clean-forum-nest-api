import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { PrismaService } from '@/infra/persistence/prisma.service'
import { makeApp } from '@tests/helpers/app/make-app'

describe('VerifyEmailValidation', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    app = await makeApp()
    prisma = app.get(PrismaService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.emailValidation.deleteMany()
  })

  it('should return 204 when email validation is verified successfully', async () => {
    const email = 'test@example.com'
    const code = '123456'

    await prisma.emailValidation.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        isVerified: false,
      },
    })

    const response = await request(app.getHttpServer())
      .post('/email-validation/verify')
      .send({ email, code })

    expect(response.statusCode).toBe(204)
    expect(response.body).toEqual({})
  })

  it('should return 404 when email validation does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/email-validation/verify')
      .send({ email: 'nonexistent@example.com', code: '123456' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'No email validation found for this email',
    })
  })
})
