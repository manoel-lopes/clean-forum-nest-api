import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, fetchQuestions } from '@tests/helpers/domain/enterprise/questions/question-requests'

describe('FetchQuestions', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 200 and fetch questions with pagination', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, token, questionData)

    const response = await fetchQuestions(app, token)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
    expect(response.body).toHaveProperty('page')
    expect(response.body).toHaveProperty('pageSize')
    expect(response.body).toHaveProperty('totalItems')
    expect(response.body).toHaveProperty('totalPages')
    expect(Array.isArray(response.body.items)).toBe(true)
  })

  it('should return 200 and fetch questions with custom page and pageSize', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, token, questionData)

    const response = await fetchQuestions(app, token, { page: 1, pageSize: 5 })

    expect(response.statusCode).toBe(200)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(5)
  })

  it('should return 200 and fetch questions without authentication', async () => {
    const response = await fetchQuestions(app)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
  })

  it('should return 200 and fetch questions with include parameter', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, token, questionData)

    const response = await fetchQuestions(app, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
  })
  })
