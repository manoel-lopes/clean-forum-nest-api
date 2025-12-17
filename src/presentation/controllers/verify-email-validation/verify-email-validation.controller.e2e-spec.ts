import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { emailValidations } from '@/infra/persistence/drizzle/schema'
import { makeApp } from '@tests/helpers/app/make-app'
import { verifyEmailValidation } from '@tests/helpers/domain/enterprise/users/email-validation-requests'

describe('VerifyEmailValidation', () => {
  let app: INestApplication
  let drizzle: DrizzleService

  beforeAll(async () => {
    app = await makeApp()
    drizzle = app.get(DrizzleService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await drizzle.db.delete(emailValidations)
  })

  it('should return 422 when email is not a valid email format', async () => {
    const response = await request(app.getHttpServer())
      .post('/email-validation/verify')
      .send({ email: 'invalid-email', code: '123456' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'email' must be a valid email address",
    })
  })

  it('should return 422 when code is not a 6-digit number', async () => {
    const response = await request(app.getHttpServer())
      .post('/email-validation/verify')
      .send({ email: 'test@example.com', code: '12345' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'code' has an invalid format",
    })
  })

  it('should return 422 when code contains non-digit characters', async () => {
    const response = await request(app.getHttpServer())
      .post('/email-validation/verify')
      .send({ email: 'test@example.com', code: '12345a' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'code' has an invalid format",
    })
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

  it('should return 204 when email validation is verified successfully', async () => {
    const email = 'test@example.com'
    const code = '123456'
    await drizzle.db.insert(emailValidations).values({
      email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      isVerified: false,
    })

    const response = await verifyEmailValidation(app, { email, code })

    expect(response.statusCode).toBe(204)
  })
})
