import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { aUser } from '@tests/builders/user.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'

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

export async function signUp (app: INestApplication, override?: { name?: string; email?: string; password?: string }) {
  const userData = aUser()
  if (override?.name) userData.withName(override.name)
  if (override?.email) userData.withEmail(override.email)
  if (override?.password) userData.withPassword(override.password)
  const user = userData.build()

  await createUser(app, user)
  const { body } = await authenticateUser(app, { email: user.email, password: user.password })

  return { token: body.token, userId: body.refreshToken.userId, refreshTokenId: body.refreshToken.id, user }
}

export async function refreshAccessToken (app: INestApplication, tokenData: RefreshTokenData) {
  return await request(app.getHttpServer()).post('/auth/refresh').send(tokenData)
}
