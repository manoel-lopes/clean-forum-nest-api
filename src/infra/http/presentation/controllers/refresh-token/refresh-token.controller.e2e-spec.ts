import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { makeApp } from '@tests/helpers/app/make-app'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'
import { refreshAccessToken } from '@tests/helpers/infra/auth/authentication-requests'

describe('RefreshAccessToken', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 201 and refresh access token', async () => {
    const { refreshTokenId } = await signUp(app)

    const response = await refreshAccessToken(app, { refreshTokenId })

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
