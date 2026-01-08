import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { CommentOnAnswerUseCase } from '@/domain/application/usecases/comment-on-answer/comment-on-answer.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aQuestion } from '@tests/builders/question.builder'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'

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
    const { token } = await signUp(app)

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
    const { token } = await signUp(appWithError)
    const { body: question } = await createQuestion(appWithError, token, aQuestion().build())
    const { body: answer } = await createAnswer(appWithError, token, { questionId: question.id, content: 'Answer content' })

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
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

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
