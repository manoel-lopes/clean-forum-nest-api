import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type UpdateCommentData = {
  content?: unknown
}

export async function deleteQuestionComment (
  app: INestApplication,
  token: string,
  {
    commentId,
  }: {
    commentId: string
  }
) {
  return request(app.getHttpServer()).delete(`/questions/comments/${commentId}`).set('Authorization', `Bearer ${token}`)
}

export async function deleteAnswerComment (
  app: INestApplication,
  token: string,
  {
    commentId,
  }: {
    commentId: string
  }
) {
  return request(app.getHttpServer()).delete(`/answers/comments/${commentId}`).set('Authorization', `Bearer ${token}`)
}

export async function updateQuestionComment (
  app: INestApplication,
  token: string,
  {
    commentId,
  }: {
    commentId: string
  },
  commentData: UpdateCommentData
) {
  return request(app.getHttpServer())
    .put(`/questions/comments/${commentId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(commentData)
}

export async function updateAnswerComment (
  app: INestApplication,
  token: string,
  {
    commentId,
  }: {
    commentId: string
  },
  commentData: UpdateCommentData
) {
  return request(app.getHttpServer())
    .put(`/answers/comments/${commentId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(commentData)
}
