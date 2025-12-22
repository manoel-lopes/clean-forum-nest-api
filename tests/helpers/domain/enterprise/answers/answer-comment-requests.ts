import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateAnswerCommentData = {
  answerId?: unknown
  content?: unknown
}

export async function commentOnAnswer (app: INestApplication, token: string , commentData: CreateAnswerCommentData) {
  const req = request(app.getHttpServer()).post('/comments/answers')
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send(commentData)
}
