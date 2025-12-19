import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { attachToAnswer } from '@tests/helpers/domain/enterprise/answers/answer-attachment-requests'

describe('AttachToAnswer', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await attachToAnswer(app, undefined, {
      answerId: 'any-id',
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
    const response = await attachToAnswer(app, 'invalid-token', {
      answerId: 'any-id',
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

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
      title: null,
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

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: null,
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'The url is required',
    })
  })

  it('should return 422 when answerId is not a valid UUID', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToAnswer(app, token, {
      answerId: 'invalid-uuid',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'answerId' must be a valid UUID",
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

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
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

  it('should attach to answer and return 201', async () => {
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

    const response = await attachToAnswer(app, token, {
      answerId,
      title: 'Attachment title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title')
    expect(response.body).toHaveProperty('url')
    expect(response.body.title).toBe('Attachment title')
    expect(response.body.url).toBe('https://example.com/file.pdf')
  })

  it('should return 404 when answer does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Attachment title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Answer not found',
    })
  })
})
