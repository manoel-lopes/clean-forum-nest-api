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

  it('should return 200 and fetch questions with include=author', async () => {
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
    const questionData = aQuestion().build()
    const createResponse = await createQuestion(app, token, questionData)
    const questionId = createResponse.body.id
    await commentOnQuestion(app, token, { questionId, content: 'Test comment' })

    const response = await fetchQuestions(app, token, { include: 'comments' })

    const question = response.body.items.find((q: { id: string }) => q.id === questionId)
    expect(response.statusCode).toBe(200)
    expect(question).toHaveProperty('comments')
    expect(Array.isArray(question.comments)).toBe(true)
    expect(question.comments.length).toBeGreaterThan(0)
  })

  it('should return 200 and fetch questions with include=attachments', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createResponse = await createQuestion(app, token, questionData)
    const questionId = createResponse.body.id
    await attachToQuestion(app, token, { questionId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestions(app, token, { include: 'attachments' })

    const question = response.body.items.find((q: { id: string }) => q.id === questionId)
    expect(response.statusCode).toBe(200)
    expect(question).toHaveProperty('attachments')
    expect(Array.isArray(question.attachments)).toBe(true)
    expect(question.attachments.length).toBeGreaterThan(0)
  })

  it('should return 200 and fetch questions with multiple include options', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createResponse = await createQuestion(app, token, questionData)
    const questionId = createResponse.body.id
    await commentOnQuestion(app, token, { questionId, content: 'Test comment' })
    await attachToQuestion(app, token, { questionId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestions(app, token, { include: 'author,comments,attachments' })

    const question = response.body.items.find((q: { id: string }) => q.id === questionId)
    expect(response.statusCode).toBe(200)
    expect(question).toHaveProperty('author')
    expect(question).toHaveProperty('comments')
    expect(question).toHaveProperty('attachments')
  })
})
