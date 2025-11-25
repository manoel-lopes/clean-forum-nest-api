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
  return req.send({
    title: updateData.title,
    url: updateData.url,
  })
}

export async function deleteAnswerAttachment (app: INestApplication, token: string, attachmentId: unknown) {
  return request(app.getHttpServer()).delete(`/answer-attachments/${attachmentId}`).set('Authorization', `Bearer ${token}`)
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
  return req.send({
    title: attachmentData.title,
    url: attachmentData.url,
  })
}
