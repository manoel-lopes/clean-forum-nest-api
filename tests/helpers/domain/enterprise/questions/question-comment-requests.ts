import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateQuestionCommentData = {
  questionId?: unknown
  content?: unknown
}

export async function commentOnQuestion (app: INestApplication, token: string, commentData: CreateQuestionCommentData) {
  return await request(app.getHttpServer())
    .post('/comments/questions')
    .set('Authorization', `Bearer ${token}`)
    .send(commentData)
}
