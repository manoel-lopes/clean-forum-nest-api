import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type UpdateCommentData = {
  content?: unknown
}

export async function deleteQuestionComment (
  app: INestApplication,
  token: string | undefined,
  {
    commentId,
  }: {
    commentId: string
  }
) {
  const req = request(app.getHttpServer()).delete(`/questions/comments/${commentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function deleteAnswerComment (
  app: INestApplication,
  token: string | undefined,
  {
    commentId,
  }: {
    commentId: string
  }
) {
  const req = request(app.getHttpServer()).delete(`/answers/comments/${commentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function updateQuestionComment (
  app: INestApplication,
  token: string | undefined,
  {
    commentId,
  }: {
    commentId: string
  },
  commentData: UpdateCommentData
) {
  const req = request(app.getHttpServer()).put(`/questions/comments/${commentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send(commentData)
}

export async function updateAnswerComment (
  app: INestApplication,
  token: string | undefined,
  {
    commentId,
  }: {
    commentId: string
  },
  commentData: UpdateCommentData
) {
  const req = request(app.getHttpServer()).put(`/answers/comments/${commentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send(commentData)
}
