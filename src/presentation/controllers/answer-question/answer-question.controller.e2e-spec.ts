import { INestApplication } from '@nestjs/common'
import { anAnswer } from '@tests/builders/answer.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import request from 'supertest'

import { AnswerQuestionUseCase } from '@/domain/application/usecases/answer-question/answer-question.usecase'

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
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
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
    const userData = aUser().build()
    await createUser(appWithError, userData)
    const authResponse = await authenticateUser(appWithError, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createQuestionResponse = await createQuestion(appWithError, token, questionData)
    const questionId = createQuestionResponse.body.id
    const answerData = anAnswer().build()
    const response = await request(appWithError.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: answerData.content })
    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })
  it('should return 201 and create answer for question', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createQuestionResponse = await createQuestion(app, token, questionData)
    const questionId = createQuestionResponse.body.id
    const answerData = anAnswer().build()
    const response = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: answerData.content })
    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('content')
    expect(response.body).toHaveProperty('questionId')
    expect(response.body.questionId).toBe(questionId)
  })
})
