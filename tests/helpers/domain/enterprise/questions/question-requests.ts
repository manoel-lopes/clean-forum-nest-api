import { uuidv7 } from 'uuidv7'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

import type { Question } from '@/domain/enterprise/entities/question.entity'

export type CreateQuestionData = {
  title?: unknown
  content?: unknown
}

export type UpdateQuestionData = {
  questionId: unknown
  title?: unknown
  content?: unknown
}

export function generateUniqueQuestionData (): CreateQuestionData {
  return {
    title: `Test Question ${uuidv7()}`,
    content: 'This is test question content',
  }
}

export async function createQuestion (app: INestApplication, token: string, questionData: CreateQuestionData) {
  const response = await request(app.getHttpServer()).post('/questions').set('Authorization', `Bearer ${token}`).send(questionData)
  return response
}

export async function fetchQuestions (
  app: INestApplication,
  token?: string,
  options?: { page?: number; pageSize?: number; include?: string }
) {
  const params = new URLSearchParams()
  if (options?.page !== undefined) params.append('page', String(options.page))
  if (options?.pageSize !== undefined) params.append('pageSize', String(options.pageSize))
  if (options?.include) params.append('include', options.include)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(app.getHttpServer()).get(`/questions${query}`).set('Authorization', `Bearer ${token}`)
}

export async function getQuestionBySlug (
  app: INestApplication,
  slug: string,
  token: string,
  options?: { include?: string; answerIncludes?: string }
) {
  const params = new URLSearchParams()
  if (options?.include) params.append('include', options.include)
  if (options?.answerIncludes) params.append('answerIncludes', options.answerIncludes)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(app.getHttpServer()).get(`/questions/slug/${slug}${query}`).set('Authorization', `Bearer ${token}`)
}

export async function getQuestionByTile (
  app: INestApplication,
  authToken: string,
  questionTitle: unknown
): Promise<Question> {
  const fetchQuestionsResponse = await fetchQuestions(app, authToken)
  if (!fetchQuestionsResponse.body || !fetchQuestionsResponse.body.items) {
    throw new Error(`Failed to fetch questions: ${JSON.stringify(fetchQuestionsResponse.body)}`)
  }
  const createdQuestion = fetchQuestionsResponse.body.items.find((q: Question) => {
    return q.title === questionTitle
  })
  if (!createdQuestion) {
    throw new Error(`Question with title "${questionTitle}" not found in ${fetchQuestionsResponse.body.items.length} questions`)
  }
  return createdQuestion
}

export async function updateQuestion (app: INestApplication, token: string | undefined, updateData: UpdateQuestionData) {
  const req = request(app.getHttpServer()).put(`/questions/${updateData.questionId}`)
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req.send({
    title: updateData.title,
    content: updateData.content,
  })
}

export async function deleteQuestion (
  app: INestApplication,
  token: string,
  {
    questionId,
  }: {
    questionId: unknown
  }
) {
  return request(app.getHttpServer()).delete(`/questions/${questionId}`).set('Authorization', `Bearer ${token}`)
}

export async function chooseQuestionBestAnswer (
  app: INestApplication,
  token: string,
  {
    answerId,
  }: {
    answerId: unknown
  }
) {
  return request(app.getHttpServer()).patch(`/answers/${answerId}/best`).set('Authorization', `Bearer ${token}`)
}
