import { INestApplication } from '@nestjs/common'

import { UpdateAnswerUseCase } from '@/domain/application/usecases/update-answer/update-answer.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aQuestion } from '@tests/builders/question.builder'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, updateAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('UpdateAnswer', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await updateAnswer(app, '', {
      answerId: 'any-id',
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
    const response = await updateAnswer(app, 'invalid-token', {
      answerId: 'any-id',
      content: 'Content',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 400 when content is missing', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
      content: undefined,
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'The content is required',
    })
  })

  it('should return 422 when answerId is not a valid UUID', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswer(app, token, {
      answerId: 'invalid-uuid',
      content: 'Updated content',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'answerId' must be a valid UUID",
    })
  })

  it('should return 404 when answer does not exist', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswer(app, token, {
      answerId: '123e4567-e89b-12d3-a456-426614174000',
      content: 'Updated content',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Answer not found',
    })
  })

  it('should return 403 when user is not the author of the answer', async () => {
    const { token: authorToken } = await signUp(app)
    const { body: question } = await createQuestion(app, authorToken, aQuestion().build())
    const { body: answer } = await createAnswer(app, authorToken, { questionId: question.id, content: 'Original content' })
    const { token: otherUserToken } = await signUp(app)

    const response = await updateAnswer(app, otherUserToken, {
      answerId: answer.id,
      content: 'Updated content',
    })

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the answer',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: UpdateAnswerUseCase,
    })
    const { token } = await signUp(appWithError)
    const { body: question } = await createQuestion(appWithError, token, aQuestion().build())
    const { body: answer } = await createAnswer(appWithError, token, { questionId: question.id, content: 'Original content' })

    const response = await updateAnswer(appWithError, token, {
      answerId: answer.id,
      content: 'Updated content',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 200 and update answer', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Original content' })

    const response = await updateAnswer(app, token, {
      answerId: answer.id,
      content: 'Updated content',
    })

    const { statusCode, body } = response
    expect(statusCode).toBe(200)
    expect(body).toHaveProperty('answer')
    expect(body.answer.content).toBe('Updated content')
    expect(body.answer.updatedAt).toBeDefined()
    expect(new Date(body.answer.updatedAt).getTime()).toBeGreaterThan(new Date(answer.updatedAt).getTime())
    expect(body.answer.createdAt).toBe(answer.createdAt)
    expect(body.answer.authorId).toBe(answer.authorId)
    expect(body.answer.id).toBe(answer.id)
  })
})
