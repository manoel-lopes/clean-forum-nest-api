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
  token: string ,
  updateData: UpdateQuestionAttachmentData
) {
  const req = request(app.getHttpServer()).put(`/question-attachments/${updateData.attachmentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send({
    title: updateData.title,
    url: updateData.url,
  })
}

export async function deleteQuestionAttachment (app: INestApplication, token: string , attachmentId: unknown) {
  const req = request(app.getHttpServer()).delete(`/question-attachments/${attachmentId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function attachToQuestion (
  app: INestApplication,
  token: string ,
  attachmentData: { questionId: unknown; title?: unknown; url?: unknown }
) {
  const req = request(app.getHttpServer()).post(`/questions/${attachmentData.questionId}/attachments`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send({
    title: attachmentData.title,
    url: attachmentData.url,
  })
}
