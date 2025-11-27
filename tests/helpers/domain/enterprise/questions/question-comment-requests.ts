import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateQuestionCommentData = {
  questionId?: unknown
  content?: unknown
}

export async function commentOnQuestion (app: INestApplication, token: string | undefined, commentData: CreateQuestionCommentData) {
  const req = request(app.getHttpServer()).post('/comments/questions')
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send(commentData)
}
