import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('ChooseQuestionBestAnswer', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .patch('/answers/any-id/best')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await request(app.getHttpServer())
      .patch('/answers/any-id/best')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 422 when answerId is not a valid UUID', async () => {
    const { token } = await signUp(app)

    const response = await request(app.getHttpServer())
      .patch('/answers/invalid-uuid/best')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'answerId' must be a valid UUID",
    })
  })

  it('should choose best answer and return 200', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answer.id}/best`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('bestAnswerId')
    expect(response.body.bestAnswerId).toBe(answer.id)
  })

  it('should return 404 when answer does not exist', async () => {
    const { token } = await signUp(app)

    const response = await request(app.getHttpServer())
      .patch('/answers/123e4567-e89b-12d3-a456-426614174000/best')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Answer not found',
    })
  })

  it('should return 403 when user is not the author of the question', async () => {
    const { token: authorToken } = await signUp(app)
    const { body: question } = await createQuestion(app, authorToken, aQuestion().build())
    const { body: answer } = await createAnswer(app, authorToken, { questionId: question.id, content: 'Answer content' })
    const { token: otherUserToken } = await signUp(app)

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answer.id}/best`)
      .set('Authorization', `Bearer ${otherUserToken}`)

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the question',
    })
  })
})
