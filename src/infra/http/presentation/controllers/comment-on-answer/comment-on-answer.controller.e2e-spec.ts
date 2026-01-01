import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { CommentOnAnswerUseCase } from '@/domain/application/usecases/comment-on-answer/comment-on-answer.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionByTile } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, fetchQuestionAnswers } from '@tests/helpers/domain/enterprise/answers/answer-requests'

describe('CommentOnAnswer', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/comments/answers')
      .send({ answerId: 'any-id', content: 'Content' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/comments/answers')
      .set('Authorization', 'Bearer invalid-token')
      .send({ answerId: 'any-id', content: 'Content' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 404 when answer does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await request(app.getHttpServer())
      .post('/comments/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answerId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is a comment',
      })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Answer not found',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: CommentOnAnswerUseCase,
    })
    const userData = aUser().build()
    await createUser(appWithError, userData)
    const authResponse = await authenticateUser(appWithError, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(appWithError, token, questionData)
    const question = await getQuestionByTile(appWithError, token, questionData.title)
    await createAnswer(appWithError, token, { questionId: question.id, content: 'Answer content' })
    const answersResponse = await fetchQuestionAnswers(appWithError, question.id, token)
    const answer = answersResponse.body.items[0]

    const response = await request(appWithError.getHttpServer())
      .post('/comments/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answerId: answer.id,
        content: 'This is a comment',
      })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should create comment on answer and return 201', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    const answersResponse = await fetchQuestionAnswers(app, question.id, token)
    const answer = answersResponse.body.items[0]

    const response = await request(app.getHttpServer())
      .post('/comments/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answerId: answer.id,
        content: 'This is a comment',
      })

    expect(response.statusCode).toBe(201)
  })
})
