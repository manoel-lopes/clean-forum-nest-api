import { INestApplication } from '@nestjs/common'
import { aQuestion } from '@tests/builders/question.builder'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import request from 'supertest'

describe('FetchUserQuestions', () => {
  let app: INestApplication
  beforeAll(async () => {
    app = await makeApp()
  })
  afterAll(async () => {
    await app.close()
  })
  it('should return 422 when userId is not a valid UUID', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/invalid-uuid/questions')
    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'userId' must be a valid UUID",
    })
  })
  it('should return 200 and fetch user questions with pagination', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const userId = authResponse.body.refreshToken.userId
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
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const userId = authResponse.body.refreshToken.userId
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
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const userId = authResponse.body.refreshToken.userId
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions`)
    expect(response.statusCode).toBe(200)
    expect(response.body.items).toEqual([])
  })
})
