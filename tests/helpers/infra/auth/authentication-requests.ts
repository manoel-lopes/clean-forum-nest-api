import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

type AuthCredentials = {
  email?: unknown
  password?: unknown
}

type RefreshTokenData = {
  refreshTokenId?: string
}

export async function authenticateUser (app: INestApplication, credentials: AuthCredentials) {
  const response = await request(app.getHttpServer()).post('/auth').send(credentials)
  return response
}

export async function refreshAccessToken (app: INestApplication, tokenData: RefreshTokenData) {
  return await request(app.getHttpServer()).post('/auth/refresh').send(tokenData)
}
