import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, fetchQuestions } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { commentOnQuestion } from '@tests/helpers/domain/enterprise/questions/question-comment-requests'
import { attachToQuestion } from '@tests/helpers/domain/enterprise/questions/question-attachment-requests'

describe('FetchQuestions', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 200 and fetch questions with pagination metadata', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())

    const response = await fetchQuestions(app, token, { page: 1, pageSize: 2 })

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(2)
    expect(typeof response.body.totalItems).toBe('number')
    expect(response.body.totalItems).toBeGreaterThanOrEqual(3)
    expect(typeof response.body.totalPages).toBe('number')
    expect(response.body.totalPages).toBeGreaterThanOrEqual(2)
  })

  it('should return 200 and fetch different items on page change', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())
    await createQuestion(app, token, aQuestion().build())

    const page1Response = await fetchQuestions(app, token, { page: 1, pageSize: 2 })
    const page2Response = await fetchQuestions(app, token, { page: 2, pageSize: 2 })

    expect(page1Response.statusCode).toBe(200)
    expect(page2Response.statusCode).toBe(200)
    expect(page1Response.body.page).toBe(1)
    expect(page2Response.body.page).toBe(2)
    expect(page1Response.body.pageSize).toBe(2)
    expect(page2Response.body.pageSize).toBe(2)
    expect(page1Response.body.totalItems).toBe(page2Response.body.totalItems)
    expect(page1Response.body.totalPages).toBe(page2Response.body.totalPages)
    expect(page1Response.body.items).toHaveLength(2)
    expect(page2Response.body.items.length).toBeGreaterThanOrEqual(1)
    const page1Ids = page1Response.body.items.map((item: { id: string }) => item.id)
    const page2Ids = page2Response.body.items.map((item: { id: string }) => item.id)
    const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id))
    expect(hasOverlap).toBe(false)
  })

  it('should return 200 and fetch questions without authentication', async () => {
    const response = await fetchQuestions(app)

    expect(response.statusCode).toBe(200)
    expect(response.body.items.length).toBeGreaterThanOrEqual(1)
    expect(response.body.page).toBe(1)
    expect(typeof response.body.totalItems).toBe('number')
    expect(typeof response.body.totalPages).toBe('number')
  })

  it('should return 200 and fetch questions with include=author', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    await createQuestion(app, token, aQuestion().build())

    const response = await fetchQuestions(app, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('author')
    expect(response.body.items[0].author).toHaveProperty('id')
    expect(response.body.items[0].author).toHaveProperty('email')
  })

  it('should return 200 and fetch questions with include=comments', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const createResponse = await createQuestion(app, token, aQuestion().build())
    const questionId = createResponse.body.id
    await commentOnQuestion(app, token, { questionId, content: 'Test comment' })

    const response = await fetchQuestions(app, token, { include: 'comments' })

    const question = response.body.items.find((q: { id: string }) => q.id === questionId)
    expect(response.statusCode).toBe(200)
    expect(question).toHaveProperty('comments')
    expect(question.comments).toHaveLength(1)
  })

  it('should return 200 and fetch questions with include=attachments', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const createResponse = await createQuestion(app, token, aQuestion().build())
    const questionId = createResponse.body.id
    await attachToQuestion(app, token, { questionId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestions(app, token, { include: 'attachments' })

    const question = response.body.items.find((q: { id: string }) => q.id === questionId)
    expect(response.statusCode).toBe(200)
    expect(question).toHaveProperty('attachments')
    expect(question.attachments).toHaveLength(1)
  })

  it('should return 200 and fetch questions with multiple include options', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const createResponse = await createQuestion(app, token, aQuestion().build())
    const questionId = createResponse.body.id
    await commentOnQuestion(app, token, { questionId, content: 'Test comment' })
    await attachToQuestion(app, token, { questionId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestions(app, token, { include: 'author,comments,attachments' })

    const question = response.body.items.find((q: { id: string }) => q.id === questionId)
    expect(response.statusCode).toBe(200)
    expect(question).toHaveProperty('author')
    expect(question).toHaveProperty('comments')
    expect(question).toHaveProperty('attachments')
    expect(question.comments).toHaveLength(1)
    expect(question.attachments).toHaveLength(1)
  })
})
