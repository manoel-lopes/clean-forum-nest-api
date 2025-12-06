import { INestApplication } from '@nestjs/common'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import request from 'supertest'

describe('RefreshAccessToken', () => {
  let app: INestApplication
  beforeAll(async () => {
    app = await makeApp()
  })
  afterAll(async () => {
    await app.close()
  })

  it('should return 201 and refresh access token', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const refreshTokenId = authResponse.body.refreshToken.id
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshTokenId })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('token')
    expect(typeof response.body.token).toBe('string')
  })

  it('should return 404 when refresh token does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshTokenId: '123e4567-e89b-12d3-a456-426614174000' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Refresh token not found',
    })
  })
})
