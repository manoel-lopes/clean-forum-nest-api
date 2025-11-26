import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'

describe('FetchUserQuestions', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 200 and fetch user questions with pagination', async () => {
    const userData = aUser().build()
    const createUserResponse = await createUser(app, userData)
    const userId = createUserResponse.body.id
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, token, questionData)

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
    expect(response.body).toHaveProperty('page')
    expect(response.body).toHaveProperty('pageSize')
    expect(response.body).toHaveProperty('totalItems')
    expect(response.body).toHaveProperty('totalPages')
    expect(Array.isArray(response.body.items)).toBe(true)
  })

  it('should return 200 and fetch user questions with custom page and pageSize', async () => {
    const userData = aUser().build()
    const createUserResponse = await createUser(app, userData)
    const userId = createUserResponse.body.id
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    await createQuestion(app, token, questionData)

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions?page=1&pageSize=5`)

    expect(response.statusCode).toBe(200)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(5)
  })

  it('should return 200 and empty array when user has no questions', async () => {
    const userData = aUser().build()
    const createUserResponse = await createUser(app, userData)
    const userId = createUserResponse.body.id

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions`)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toEqual([])
  })
  })
