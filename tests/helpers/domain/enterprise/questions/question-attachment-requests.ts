import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateQuestionAttachmentData = {
  questionId: unknown
  title: unknown
  url: unknown
}

export type UpdateQuestionAttachmentData = {
  attachmentId: unknown
  title?: unknown
  url?: unknown
}

export async function createQuestionAttachment (
  app: INestApplication,
  token: string,
  attachmentData: CreateQuestionAttachmentData
) {
  return request(app.getHttpServer())
    .post(`/questions/${attachmentData.questionId}/attachments`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: attachmentData.title,
      url: attachmentData.url,
    })
}

export async function updateQuestionAttachment (
  app: INestApplication,
  token: string | undefined,
  updateData: UpdateQuestionAttachmentData
) {
  const req = request(app.getHttpServer()).put(`/question-attachments/${updateData.attachmentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  const body: Record<string, unknown> = {}
  if (updateData.title) body.title = updateData.title
  if (updateData.url) body.url = updateData.url
  return req.send(body)
}

export async function deleteQuestionAttachment (app: INestApplication, token: string | undefined, attachmentId: unknown) {
  const req = request(app.getHttpServer()).delete(`/question-attachments/${attachmentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function attachToQuestion (
  app: INestApplication,
  token: string | undefined,
  attachmentData: { questionId: unknown; title?: unknown; url?: unknown }
) {
  const req = request(app.getHttpServer()).post(`/questions/${attachmentData.questionId}/attachments`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  const body: Record<string, unknown> = {}
  if (attachmentData.title) body.title = attachmentData.title
  if (attachmentData.url) body.url = attachmentData.url
  return req.send(body)
}
