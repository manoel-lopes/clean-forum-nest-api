import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, fetchQuestionAnswers } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { commentOnAnswer } from '@tests/helpers/domain/enterprise/answers/answer-comment-requests'
import { attachToAnswer } from '@tests/helpers/domain/enterprise/answers/answer-attachment-requests'

describe('FetchQuestionAnswers', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 422 when questionId is not a valid UUID', async () => {
    const response = await fetchQuestionAnswers(app, 'invalid-uuid')

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'questionId' must be a valid UUID",
    })
  })

  it('should return 404 when question does not exist', async () => {
    const response = await fetchQuestionAnswers(app, '123e4567-e89b-12d3-a456-426614174000')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 200 and fetch question answers with pagination metadata', async () => {
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
    await createAnswer(app, token, { questionId, content: 'Answer 1' })
    await createAnswer(app, token, { questionId, content: 'Answer 2' })
    await createAnswer(app, token, { questionId, content: 'Answer 3' })

    const response = await fetchQuestionAnswers(app, questionId, token, { page: 1, pageSize: 2 })

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(2)
    expect(response.body.totalItems).toBe(3)
    expect(response.body.totalPages).toBe(2)
  })

  it('should return 200 and fetch different items on page change', async () => {
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
    await createAnswer(app, token, { questionId, content: 'Answer 1' })
    await createAnswer(app, token, { questionId, content: 'Answer 2' })
    await createAnswer(app, token, { questionId, content: 'Answer 3' })

    const page1Response = await fetchQuestionAnswers(app, questionId, token, { page: 1, pageSize: 2 })
    const page2Response = await fetchQuestionAnswers(app, questionId, token, { page: 2, pageSize: 2 })

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

  it('should return 200 and fetch answers with include=author', async () => {
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
    expect(response.body.items[0]).toHaveProperty('author')
    expect(response.body.items[0].author).toHaveProperty('id')
    expect(response.body.items[0].author).toHaveProperty('email')
  })

  it('should return 200 and fetch answers with include=comments', async () => {
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
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    await commentOnAnswer(app, token, { answerId, content: 'Test comment' })

    const response = await fetchQuestionAnswers(app, questionId, token, { include: 'comments' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('comments')
    expect(Array.isArray(response.body.items[0].comments)).toBe(true)
    expect(response.body.items[0].comments.length).toBeGreaterThan(0)
  })

  it('should return 200 and fetch answers with include=attachments', async () => {
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
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    await attachToAnswer(app, token, { answerId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestionAnswers(app, questionId, token, { include: 'attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('attachments')
    expect(Array.isArray(response.body.items[0].attachments)).toBe(true)
    expect(response.body.items[0].attachments.length).toBeGreaterThan(0)
  })

  it('should return 200 and fetch answers with multiple include options', async () => {
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
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    await commentOnAnswer(app, token, { answerId, content: 'Test comment' })
    await attachToAnswer(app, token, { answerId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestionAnswers(app, questionId, token, { include: 'author,comments,attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('author')
    expect(response.body.items[0]).toHaveProperty('comments')
    expect(response.body.items[0]).toHaveProperty('attachments')
  })
})
