import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'

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

  it('should create comment on answer and return 201', async () => {
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
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id

    const response = await request(app.getHttpServer())
      .post('/comments/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answerId,
        content: 'This is a comment',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('content')
    expect(response.body.content).toBe('This is a comment')
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
        answerId: 'non-existent-id',
        content: 'This is a comment',
      })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Answer not found',
    })
  })
})
