import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { AnswerQuestionUseCase } from '@/domain/application/usecases/answer-question/answer-question.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aQuestion } from '@tests/builders/question.builder'
import { anAnswer } from '@tests/builders/answer.builder'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('AnswerQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions/any-id/answers')
      .send({ content: 'Some content' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions/any-id/answers')
      .set('Authorization', 'Bearer invalid-token')
      .send({ content: 'Some content' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 404 when question does not exist', async () => {
    const { token } = await signUp(app)

    const response = await request(app.getHttpServer())
      .post('/questions/123e4567-e89b-12d3-a456-426614174000/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Some content' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: AnswerQuestionUseCase,
    })
    const { token } = await signUp(appWithError)
    const { body: question } = await createQuestion(appWithError, token, aQuestion().build())

    const response = await request(appWithError.getHttpServer())
      .post(`/questions/${question.id}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: anAnswer().build().content })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 201 and create answer for question', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: anAnswer().build().content })

    expect(response.statusCode).toBe(201)
  })
})
