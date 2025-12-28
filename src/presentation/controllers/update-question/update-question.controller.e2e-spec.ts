import { INestApplication } from '@nestjs/common'

import { UpdateQuestionUseCase } from '@/domain/application/usecases/update-question/update-question.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionByTile, updateQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { uuidv7 } from 'uuidv7'

describe('UpdateQuestion', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await updateQuestion(app, '', {
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
      questionId: uuidv7(),
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

  it('should return 403 when user is not the author of the question', async () => {
    const authorData = aUser().build()
    await createUser(app, authorData)
    const authorAuthResponse = await authenticateUser(app, {
      email: authorData.email,
      password: authorData.password,
    })
    const authorToken = authorAuthResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, authorToken, questionData)
    const question = await getQuestionByTile(app, authorToken, questionData.title)
    const otherUserData = aUser().build()
    await createUser(app, otherUserData)
    const otherUserAuthResponse = await authenticateUser(app, {
      email: otherUserData.email,
      password: otherUserData.password,
    })
    const otherUserToken = otherUserAuthResponse.body.token

    const response = await updateQuestion(app, otherUserToken, {
      questionId: question.id,
      title: 'Updated Title',
      content: 'Updated Content',
    })

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the question',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: UpdateQuestionUseCase,
    })
    const userData = aUser().build()
    await createUser(appWithError, userData)
    const authResponse = await authenticateUser(appWithError, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(appWithError, token, questionData)
    const question = await getQuestionByTile(appWithError, token, questionData.title)

    const response = await updateQuestion(appWithError, token, {
      questionId: question.id,
      title: 'Updated Title',
      content: 'Updated Content',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)

    const response = await updateQuestion(app, token, {
      questionId: question.id,
      title: 'updated title',
      content: 'updated content',
    })

    const { statusCode, body } = response
    expect(statusCode).toBe(200)
    expect(body).toHaveProperty('question')
    expect(body.question.title).toBe('updated title')
    expect(body.question.content).toBe('updated content')
    expect(body.question.updatedAt).toBeDefined()
    expect(new Date(body.question.updatedAt).getTime())
    .toBeGreaterThan(new Date(question.updatedAt).getTime())
    expect(body.question.createdAt).toBe(question.createdAt)
    expect(body.question.authorId).toBe(question.authorId)
    expect(body.question.slug).toBe(question.slug)
    expect(body.question.id).toBe(question.id)
  })
})
