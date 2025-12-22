import { INestApplication } from '@nestjs/common'

import { CreateQuestionUseCase } from '@/domain/application/usecases/create-question/create-question.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'

describe('CreateQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const questionData = aQuestion().build()

    const response = await createQuestion(app, '', questionData)

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const questionData = aQuestion().build()

    const response = await createQuestion(app, 'invalid-token', questionData)

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 409 when question with same title already exists', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()

    await createQuestion(app, token, questionData)
    const response = await createQuestion(app, token, questionData)

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      statusCode: 409,
      error: 'Conflict',
      message: 'Question with title already registered',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: CreateQuestionUseCase,
    })
    const userData = aUser().build()
    await createUser(appWithError, userData)
    const authResponse = await authenticateUser(appWithError, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()

    const response = await createQuestion(appWithError, token, questionData)

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 201 and create a new question', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()

    const response = await createQuestion(app, token, questionData)

    expect(response.statusCode).toBe(201)
  })
})
