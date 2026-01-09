import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { signUp, makeExpiredToken } from '@tests/helpers/infra/auth/authentication-requests'
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

  it('should return 401 when invalid token is provided', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const response = await fetchQuestionAnswers(app, question.id, 'invalid-token')

    expect(response.statusCode).toBe(401)
  })

  it('should return 401 when token is expired', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const expiredToken = makeExpiredToken(app)
    const response = await fetchQuestionAnswers(app, question.id, expiredToken)

    expect(response.statusCode).toBe(401)
  })

  it('should return 200 and fetch question answers with pagination metadata', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await createAnswer(app, token, { questionId: question.id, content: 'Answer 1' })
    await createAnswer(app, token, { questionId: question.id, content: 'Answer 2' })
    await createAnswer(app, token, { questionId: question.id, content: 'Answer 3' })

    const response = await fetchQuestionAnswers(app, question.id, token, { page: 1, pageSize: 2 })

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(2)
    expect(response.body.totalItems).toBe(3)
    expect(response.body.totalPages).toBe(2)
  })

  it('should return 200 and fetch different items on page change', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await createAnswer(app, token, { questionId: question.id, content: 'Answer 1' })
    await createAnswer(app, token, { questionId: question.id, content: 'Answer 2' })
    await createAnswer(app, token, { questionId: question.id, content: 'Answer 3' })

    const page1Response = await fetchQuestionAnswers(app, question.id, token, { page: 1, pageSize: 2 })
    const page2Response = await fetchQuestionAnswers(app, question.id, token, { page: 2, pageSize: 2 })

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
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())

    const response = await fetchQuestionAnswers(app, question.id)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
  })

  it('should return 200 and fetch answers with include=author', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

    const response = await fetchQuestionAnswers(app, question.id, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('author')
    expect(response.body.items[0].author).toHaveProperty('id')
    expect(response.body.items[0].author).toHaveProperty('email')
  })

  it('should return 200 and fetch answers with include=comments', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await commentOnAnswer(app, token, { answerId: answer.id, content: 'Test comment' })

    const response = await fetchQuestionAnswers(app, question.id, token, { include: 'comments' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('comments')
    expect(Array.isArray(response.body.items[0].comments)).toBe(true)
    expect(response.body.items[0].comments.length).toBeGreaterThan(0)
  })

  it('should return 200 and fetch answers with include=attachments', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await attachToAnswer(app, token, { answerId: answer.id, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestionAnswers(app, question.id, token, { include: 'attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('attachments')
    expect(Array.isArray(response.body.items[0].attachments)).toBe(true)
    expect(response.body.items[0].attachments.length).toBeGreaterThan(0)
  })

  it('should return 200 and fetch answers with multiple include options', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await commentOnAnswer(app, token, { answerId: answer.id, content: 'Test comment' })
    await attachToAnswer(app, token, { answerId: answer.id, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await fetchQuestionAnswers(app, question.id, token, { include: 'author,comments,attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body.items[0]).toHaveProperty('author')
    expect(response.body.items[0]).toHaveProperty('comments')
    expect(response.body.items[0]).toHaveProperty('attachments')
  })
})
