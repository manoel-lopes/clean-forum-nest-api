import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, updateQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'

describe('UpdateQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await updateQuestion(app, undefined, {
      questionId: 'any-id',
      title: 'Title',
      content: 'Content',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await updateQuestion(app, 'invalid-token', {
      questionId: 'any-id',
      title: 'Title',
      content: 'Content',
    })

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

    const response = await updateQuestion(app, token, {
      questionId: 'non-existent-id',
      title: 'Updated Title',
      content: 'Updated Content',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 200 and update question', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createResponse = await createQuestion(app, token, questionData)
    const questionId = createResponse.body.id

    const response = await updateQuestion(app, token, {
      questionId,
      title: 'Updated Title',
      content: 'Updated Content',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('question')
    expect(response.body.question.title).toBe('Updated Title')
    expect(response.body.question.content).toBe('Updated Content')
  })
})
