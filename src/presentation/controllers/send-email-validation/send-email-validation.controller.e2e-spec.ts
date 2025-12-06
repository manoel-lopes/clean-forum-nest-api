import { INestApplication } from '@nestjs/common'
import { makeApp } from '@tests/helpers/app/make-app'
import request from 'supertest'

describe('SendEmailValidation', () => {
  let app: INestApplication
  beforeAll(async () => {
    app = await makeApp()
  })
  afterAll(async () => {
    await app.close()
  })

  it('should return 204 when email validation is sent successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/email-validation/send')
      .send({ email: 'test@example.com' })

    expect(response.statusCode).toBe(204)
    expect(response.body).toEqual({})
  })
})
