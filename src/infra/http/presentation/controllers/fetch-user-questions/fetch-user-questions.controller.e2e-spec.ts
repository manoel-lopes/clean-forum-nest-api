import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'

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

  it('should return 200 and fetch user questions with pagination metadata', async () => {
    const { token, userId } = await signUp(app)
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions?page=1&pageSize=2`)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(2)
    expect(response.body.totalItems).toBe(3)
    expect(response.body.totalPages).toBe(2)
  })

  it('should return 200 and fetch different items on page change', async () => {
    const { token, userId } = await signUp(app)
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())

    const page1Response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions?page=1&pageSize=2`)
    const page2Response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions?page=2&pageSize=2`)

    expect(page1Response.statusCode).toBe(200)
    expect(page2Response.statusCode).toBe(200)
    expect(page1Response.body.page).toBe(1)
    expect(page2Response.body.page).toBe(2)
    expect(page1Response.body.pageSize).toBe(2)
    expect(page2Response.body.pageSize).toBe(2)
    expect(page1Response.body.totalItems).toBe(3)
    expect(page2Response.body.totalItems).toBe(3)
    expect(page1Response.body.totalPages).toBe(2)
    expect(page2Response.body.totalPages).toBe(2)
    expect(page1Response.body.items).toHaveLength(2)
    expect(page2Response.body.items).toHaveLength(1)
    const page1Ids = page1Response.body.items.map((item: { id: string }) => item.id)
    const page2Ids = page2Response.body.items.map((item: { id: string }) => item.id)
    const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id))
    expect(hasOverlap).toBe(false)
  })

  it('should return 200 and empty array when user has no questions', async () => {
    const { userId } = await signUp(app)

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/questions`)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toEqual([])
  })
})
