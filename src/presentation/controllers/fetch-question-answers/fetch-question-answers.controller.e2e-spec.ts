import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, fetchQuestionAnswers } from '@tests/helpers/domain/enterprise/answers/answer-requests'

describe('FetchQuestionAnswersController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 404 when question does not exist', async () => {
    const response = await fetchQuestionAnswers(app, 'non-existent-id')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 200 and fetch question answers with pagination', async () => {
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
    await createAnswer(app, token, { questionId, content: 'Answer content' })

    const response = await fetchQuestionAnswers(app, questionId, token)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
    expect(response.body).toHaveProperty('page')
    expect(response.body).toHaveProperty('pageSize')
    expect(response.body).toHaveProperty('totalItems')
    expect(response.body).toHaveProperty('totalPages')
    expect(Array.isArray(response.body.items)).toBe(true)
  })

  it('should return 200 and fetch answers with custom page and pageSize', async () => {
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
    await createAnswer(app, token, { questionId, content: 'Answer content' })

    const response = await fetchQuestionAnswers(app, questionId, token, { page: 1, pageSize: 5 })

    expect(response.statusCode).toBe(200)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(5)
  })

  it('should return 200 and fetch answers without authentication', async () => {
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

    const response = await fetchQuestionAnswers(app, questionId)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
  })

  it('should return 200 and fetch answers with include parameter', async () => {
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
    await createAnswer(app, token, { questionId, content: 'Answer content' })

    const response = await fetchQuestionAnswers(app, questionId, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
  })
})
