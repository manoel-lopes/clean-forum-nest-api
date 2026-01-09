import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'
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
    const response = await attachToAnswer(app, '', {
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

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)

    const response = await attachToAnswer(app, expiredToken, {
      answerId: 'any-id',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 400 when title is missing', async () => {
    const { token } = await signUp(app)

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
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
    const { token } = await signUp(app)

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
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

  it('should return 422 when answerId is not a valid UUID', async () => {
    const { token } = await signUp(app)

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
    const { token } = await signUp(app)

    const response = await attachToAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: 'invalid-url',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'url' is invalid",
    })
  })

  it('should attach to answer and return 201', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

    const response = await attachToAnswer(app, token, {
      answerId: answer.id,
      title: 'Attachment title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(201)
  })

  it('should return 404 when answer does not exist', async () => {
    const { token } = await signUp(app)

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
