import { INestApplication } from '@nestjs/common'

import { CreateQuestionUseCase } from '@/domain/application/usecases/create-question/create-question.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aQuestion } from '@tests/builders/question.builder'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('CreateQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await createQuestion(app, '', aQuestion().build())

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await createQuestion(app, 'invalid-token', aQuestion().build())

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 409 when question with same title already exists', async () => {
    const { token } = await signUp(app)
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
    const { token } = await signUp(appWithError)

    const response = await createQuestion(appWithError, token, aQuestion().build())

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 201 and create a new question', async () => {
    const { token } = await signUp(app)

    const response = await createQuestion(app, token, aQuestion().build())

    expect(response.statusCode).toBe(201)
  })
})
