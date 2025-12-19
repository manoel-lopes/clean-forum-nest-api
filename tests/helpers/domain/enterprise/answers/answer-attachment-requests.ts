import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateAnswerAttachmentData = {
  answerId: unknown
  title: unknown
  url: unknown
}

export type UpdateAnswerAttachmentData = {
  attachmentId: unknown
  title?: unknown
  url?: unknown
}

export async function createAnswerAttachment (
  app: INestApplication,
  token: string,
  attachmentData: CreateAnswerAttachmentData
) {
  return request(app.getHttpServer())
    .post(`/answers/${attachmentData.answerId}/attachments`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: attachmentData.title,
      url: attachmentData.url,
    })
}

export async function updateAnswerAttachment (
  app: INestApplication,
  token: string | undefined,
  updateData: UpdateAnswerAttachmentData
) {
  const req = request(app.getHttpServer()).put(`/answer-attachments/${updateData.attachmentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  const body: Record<string, unknown> = {}
  if (updateData.title) body.title = updateData.title
  if (updateData.url) body.url = updateData.url
  return req.send(body)
}

export async function deleteAnswerAttachment (app: INestApplication, token: string | undefined, attachmentId: unknown) {
  const req = request(app.getHttpServer()).delete(`/answer-attachments/${attachmentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function attachToAnswer (
  app: INestApplication,
  token: string | undefined,
  attachmentData: { answerId: unknown; title?: unknown; url?: unknown }
) {
  const req = request(app.getHttpServer()).post(`/answers/${attachmentData.answerId}/attachments`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  const body: Record<string, unknown> = {}
  if (attachmentData.title) body.title = attachmentData.title
  if (attachmentData.url) body.url = attachmentData.url
  return req.send(body)
}
