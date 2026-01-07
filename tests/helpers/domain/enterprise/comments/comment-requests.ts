import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type UpdateCommentData = {
  content?: unknown
}

export async function deleteComment (
  app: INestApplication,
  token: string,
  {
    commentId,
  }: {
    commentId: string
  }
) {
  const req = request(app.getHttpServer()).delete(`/comments/${commentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function updateComment (
  app: INestApplication,
  token: string,
  {
    commentId,
  }: {
    commentId: string
  },
  commentData: UpdateCommentData
) {
  const req = request(app.getHttpServer()).put(`/comments/${commentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send(commentData)
}
