import { INestApplication } from '@nestjs/common'

import { DeleteQuestionUseCase } from '@/domain/application/usecases/delete-question/delete-question.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aQuestion } from '@tests/builders/question.builder'
import { createQuestion, deleteQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { signUp, makeExpiredToken } from '@tests/helpers/infra/auth/authentication-requests'

describe('DeleteQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await deleteQuestion(app, '', { questionId: 'any-id' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await deleteQuestion(app, 'invalid-token', { questionId: 'any-id' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)
    const response = await deleteQuestion(app, expiredToken, { questionId: 'any-id' })

    expect(response.statusCode).toBe(401)
  })

  it('should return 422 when questionId is not a valid UUID', async () => {
    const { token } = await signUp(app)

    const response = await deleteQuestion(app, token, { questionId: 'invalid-uuid' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'questionId' must be a valid UUID",
    })
  })

  it('should return 404 when question does not exist', async () => {
    const { token } = await signUp(app)

    const response = await deleteQuestion(app, token, { questionId: '123e4567-e89b-12d3-a456-426614174000' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 403 when user is not the author of the question', async () => {
    const { token: authorToken } = await signUp(app)
    const { body: question } = await createQuestion(app, authorToken, aQuestion().build())
    const { token: otherUserToken } = await signUp(app)

    const response = await deleteQuestion(app, otherUserToken, { questionId: question.id })

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the question',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: DeleteQuestionUseCase,
    })
    const { token } = await signUp(appWithError)
    const { body: question } = await createQuestion(appWithError, token, aQuestion().build())

    const response = await deleteQuestion(appWithError, token, { questionId: question.id })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 204 and delete question', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())

    const response = await deleteQuestion(app, token, { questionId: question.id })

    expect(response.statusCode).toBe(204)
  })
})
