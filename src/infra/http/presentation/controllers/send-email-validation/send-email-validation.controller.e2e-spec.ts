import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'

import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { makeApp } from '@tests/helpers/app/make-app'

describe('SendEmailValidation', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    app = await makeApp()
    dataSource = app.get(DataSource)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await dataSource.getRepository(EmailValidation).clear()
  })

  it('should return 204 when email validation is sent successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/email-validation/send')
      .send({ email: 'test@example.com' })

    expect(response.statusCode).toBe(204)
  })

  it('should save a new email validation with a 6-digit code', async () => {
    const email = 'newuser@example.com'

    await request(app.getHttpServer())
      .post('/email-validation/send')
      .send({ email })

    const repository = dataSource.getRepository(EmailValidation)
    const savedValidation = await repository.findOneBy({ email })

    expect(savedValidation).not.toBeNull()
    expect(savedValidation?.code).toHaveLength(6)
    expect(/^\d{6}$/.test(savedValidation?.code ?? '')).toBe(true)
    expect(savedValidation?.isVerified).toBe(false)
  })

  it('should update existing validation with a new code when resending', async () => {
    const email = 'existinguser@example.com'
    const repository = dataSource.getRepository(EmailValidation)

    await request(app.getHttpServer())
      .post('/email-validation/send')
      .send({ email })

    const firstValidation = await repository.findOneBy({ email })
    const firstCode = firstValidation?.code

    await request(app.getHttpServer())
      .post('/email-validation/send')
      .send({ email })

    const updatedValidation = await repository.findOneBy({ email })

    expect(updatedValidation?.id).toBe(firstValidation?.id)
    expect(updatedValidation?.code).not.toBe(firstCode)
    expect(updatedValidation?.code).toHaveLength(6)
  })
})
