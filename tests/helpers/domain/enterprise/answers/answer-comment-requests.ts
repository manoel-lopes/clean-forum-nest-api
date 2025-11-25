import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateAnswerCommentData = {
  answerId?: unknown
  content?: unknown
}

export async function commentOnAnswer (app: INestApplication, token: string, commentData: CreateAnswerCommentData) {
  return await request(app.getHttpServer())
    .post('/comments/answers')
    .set('Authorization', `Bearer ${token}`)
    .send(commentData)
}
