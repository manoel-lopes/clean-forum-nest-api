import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export type CreateAnswerData = {
  questionId?: unknown
  content?: unknown
}

export type UpdateAnswerData = {
  answerId: unknown
  content?: unknown
}

export async function createAnswer (app: INestApplication, token: string | undefined, answerData: CreateAnswerData) {
  const req = request(app.getHttpServer()).post(`/questions/${answerData.questionId}/answers`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send(answerData)
}

export async function updateAnswer (app: INestApplication, token: string | undefined, updateData: UpdateAnswerData) {
  const req = request(app.getHttpServer()).put(`/answers/${updateData.answerId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send({
    content: updateData.content,
  })
}

export async function deleteAnswer (
  app: INestApplication,
  token: string | undefined,
  {
    answerId,
  }: {
    answerId: unknown
  }
) {
  const req = request(app.getHttpServer()).delete(`/answers/${answerId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
}

export async function fetchQuestionAnswers (
  app: INestApplication,
  questionId: string,
  token?: string,
  options?: { page?: number; pageSize?: number; include?: string; order?: 'asc' | 'desc' }
) {
  const params = new URLSearchParams()
  if (options?.page !== undefined) params.append('page', String(options.page))
  if (options?.pageSize !== undefined) params.append('pageSize', String(options.pageSize))
  if (options?.order) params.append('order', options.order)
  if (options?.include) params.append('include', options.include)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(app.getHttpServer()).get(`/questions/${questionId}/answers${query}`).set('Authorization', `Bearer ${token}`)
}
