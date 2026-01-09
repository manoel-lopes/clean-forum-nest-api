import { INestApplication } from '@nestjs/common'

import { DeleteAnswerUseCase } from '@/domain/application/usecases/delete-answer/delete-answer.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aQuestion } from '@tests/builders/question.builder'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, deleteAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('DeleteAnswer', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await deleteAnswer(app, '', { answerId: 'any-id' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await deleteAnswer(app, 'invalid-token', { answerId: 'any-id' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)
    const response = await deleteAnswer(app, expiredToken, { answerId: 'any-id' })

    expect(response.statusCode).toBe(401)
  })

  it('should return 422 when answerId is not a valid UUID', async () => {
    const { token } = await signUp(app)

    const response = await deleteAnswer(app, token, { answerId: 'invalid-uuid' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'answerId' must be a valid UUID",
    })
  })

  it('should return 404 when answer does not exist', async () => {
    const { token } = await signUp(app)

    const response = await deleteAnswer(app, token, { answerId: '123e4567-e89b-12d3-a456-426614174000' })

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
    const { body: answer } = await createAnswer(app, authorToken, { questionId: question.id, content: 'Answer content' })
    const { token: otherUserToken } = await signUp(app)

    const response = await deleteAnswer(app, otherUserToken, { answerId: answer.id })

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the answer',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: DeleteAnswerUseCase,
    })
    const { token } = await signUp(appWithError)
    const { body: question } = await createQuestion(appWithError, token, aQuestion().build())
    const { body: answer } = await createAnswer(appWithError, token, { questionId: question.id, content: 'Answer content' })

    const response = await deleteAnswer(appWithError, token, { answerId: answer.id })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 204 and delete answer', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

    const response = await deleteAnswer(app, token, { answerId: answer.id })

    expect(response.statusCode).toBe(204)
  })
})
