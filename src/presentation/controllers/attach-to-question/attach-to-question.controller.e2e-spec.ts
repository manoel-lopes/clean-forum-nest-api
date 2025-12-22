import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionByTile } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { attachToQuestion } from '@tests/helpers/domain/enterprise/questions/question-attachment-requests'

describe('AttachToQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await attachToQuestion(app, '', {
      questionId: 'any-id',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await attachToQuestion(app, 'invalid-token', {
      questionId: 'any-id',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 400 when title is missing', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToQuestion(app, token, {
      questionId: '123e4567-e89b-12d3-a456-426614174000',
      title: undefined,
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'The title is required',
    })
  })

  it('should return 400 when url is missing', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToQuestion(app, token, {
      questionId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: undefined,
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'The url is required',
    })
  })

  it('should return 422 when questionId is not a valid UUID', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToQuestion(app, token, {
      questionId: 'invalid-uuid',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'questionId' must be a valid UUID",
    })
  })

  it('should return 422 when url is not a valid URL', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToQuestion(app, token, {
      questionId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: 'invalid-url',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'url' must be a valid URL",
    })
  })

  it('should attach to question and return 201', async () => {
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

    const response = await attachToQuestion(app, token, {
      questionId: question.id,
      title: 'Attachment title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(201)
  })

  it('should return 404 when question does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToQuestion(app, token, {
      questionId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Attachment title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })
})
