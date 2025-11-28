import { INestApplication } from '@nestjs/common'

import { DeleteAnswerUseCase } from '@/domain/application/usecases/delete-answer/delete-answer.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, deleteAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'

describe('DeleteAnswer', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await deleteAnswer(app, undefined, { answerId: 'any-id' })

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

  it('should return 422 when answerId is not a valid UUID', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await deleteAnswer(app, token, { answerId: 'invalid-uuid' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'answerId' must be a valid UUID",
    })
  })

  it('should return 404 when answer does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await deleteAnswer(app, token, { answerId: '123e4567-e89b-12d3-a456-426614174000' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Answer not found',
    })
  })

  it('should return 403 when user is not the author of the answer', async () => {
    const authorData = aUser().build()
    await createUser(app, authorData)
    const authorAuthResponse = await authenticateUser(app, {
      email: authorData.email,
      password: authorData.password,
    })
    const authorToken = authorAuthResponse.body.token
    const questionData = aQuestion().build()
    const createQuestionResponse = await createQuestion(app, authorToken, questionData)
    const questionId = createQuestionResponse.body.id
    const createAnswerResponse = await createAnswer(app, authorToken, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    const otherUserData = aUser().build()
    await createUser(app, otherUserData)
    const otherUserAuthResponse = await authenticateUser(app, {
      email: otherUserData.email,
      password: otherUserData.password,
    })
    const otherUserToken = otherUserAuthResponse.body.token

    const response = await deleteAnswer(app, otherUserToken, { answerId })

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the answer',
    })
  })

  it('should return 500 when an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: DeleteAnswerUseCase,
    })
    const userData = aUser().build()
    await createUser(appWithError, userData)
    const authResponse = await authenticateUser(appWithError, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createQuestionResponse = await createQuestion(appWithError, token, questionData)
    const questionId = createQuestionResponse.body.id
    const createAnswerResponse = await createAnswer(appWithError, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id

    const response = await deleteAnswer(appWithError, token, { answerId })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 204 and delete answer', async () => {
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

    const response = await deleteAnswer(app, token, { answerId })

    expect(response.statusCode).toBe(204)
  })
})
