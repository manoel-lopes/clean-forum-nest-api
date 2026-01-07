import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { PaginationParams } from '@/core/domain/application/pagination-params'

export async function fetchNotifications (
  app: INestApplication,
  authToken: string,
  params?: PaginationParams,
) {
  const queryParams = params
    ? `?${Object.entries(params)
        .map(([key, value]) => (value !== undefined ? `${key}=${value}` : ''))
        .filter(Boolean)
        .join('&')}`
    : ''
  const req = request(app.getHttpServer()).get(`/notifications${queryParams}`)
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`)
  }
  return req
}

export async function readNotification (
  app: INestApplication,
  authToken: string,
  notificationId: string,
) {
  const req = request(app.getHttpServer()).patch(`/notifications/${notificationId}/read`)
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`)
  }
  return req
}
