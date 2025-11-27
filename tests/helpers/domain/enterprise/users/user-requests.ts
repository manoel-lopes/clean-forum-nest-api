import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { PaginationParams } from '@/core/domain/application/pagination-params'

export type CreateUserData = {
  name?: unknown
  email?: unknown
  password?: unknown
}

export async function createUser (app: INestApplication, userData: CreateUserData) {
  const response = await request(app.getHttpServer()).post('/users').send(userData)
  return response
}

export async function deleteUser (app: INestApplication, authToken: string | undefined) {
  const req = request(app.getHttpServer()).delete('/users')
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`)
  }
  return req
}

export async function fetchUsers (app: INestApplication, authToken: string, params?: PaginationParams) {
  const queryParams = params
    ? `?${Object.entries(params)
        .map(([key, value]) => (value !== undefined ? `${key}=${value}` : ''))
        .filter(Boolean)
        .join('&')}`
    : ''
  return await request(app.getHttpServer()).get(`/users${queryParams}`).set('Authorization', `Bearer ${authToken}`)
}

export async function getUserByEmail (
  app: INestApplication,
  authToken: string | undefined,
  {
    email,
  }: {
    email: unknown
  }
) {
  const req = request(app.getHttpServer()).get(`/users/email/${email}`)
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`)
  }
  return await req
}
