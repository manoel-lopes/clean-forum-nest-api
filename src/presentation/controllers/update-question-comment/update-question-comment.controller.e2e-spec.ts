import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { aQuestion } from '@tests/builders/question.builder'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

describe('UpdateQuestionCommentController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should update question comment and return 200', async () => {
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
    const createCommentResponse = await request(app.getHttpServer())
      .post('/comments/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId, content: 'Original comment' })
    const commentId = createCommentResponse.body.id

    const response = await request(app.getHttpServer())
      .put(`/questions/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated comment' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('content')
    expect(response.body.content).toBe('Updated comment')
  })

  it('should return 404 when comment does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await request(app.getHttpServer())
      .put('/questions/comments/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated comment' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Comment not found',
    })
})
})