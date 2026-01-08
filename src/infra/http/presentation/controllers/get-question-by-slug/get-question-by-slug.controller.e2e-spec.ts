import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionBySlug } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { attachToQuestion } from '@tests/helpers/domain/enterprise/questions/question-attachment-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { commentOnAnswer } from '@tests/helpers/domain/enterprise/answers/answer-comment-requests'
import { attachToAnswer } from '@tests/helpers/domain/enterprise/answers/answer-attachment-requests'

describe('GetQuestionBySlug', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 404 when question with slug does not exist', async () => {
    const { token } = await signUp(app)

    const response = await getQuestionBySlug(app, 'non-existent-slug', token)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 200 and get question by slug', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())

    const response = await getQuestionBySlug(app, question.slug, token)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title')
    expect(response.body).toHaveProperty('content')
    expect(response.body).toHaveProperty('slug')
    expect(response.body.slug).toBe(question.slug)
  })

  it('should return 200 and get question with include=author', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())

    const response = await getQuestionBySlug(app, question.slug, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body.author).toHaveProperty('id')
    expect(response.body.author).toHaveProperty('email')
  })

  it('should return 200 and get question with include=attachments', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await attachToQuestion(app, token, { questionId: question.id, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, question.slug, token, { include: 'attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('attachments')
    expect(Array.isArray(response.body.attachments)).toBe(true)
    expect(response.body.attachments.length).toBeGreaterThan(0)
  })

  it('should return 200 and get question with multiple include options', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await attachToQuestion(app, token, { questionId: question.id, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, question.slug, token, { include: 'author,attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body).toHaveProperty('attachments')
  })

  it('should return 200 and get question with answerIncludes=author', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

    const response = await getQuestionBySlug(app, question.slug, token, { answerIncludes: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('author')
  })

  it('should return 200 and get question with answerIncludes=comments', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await commentOnAnswer(app, token, { answerId: answer.id, content: 'Answer comment' })

    const response = await getQuestionBySlug(app, question.slug, token, { answerIncludes: 'comments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('comments')
    expect(Array.isArray(response.body.answers.items[0].comments)).toBe(true)
  })

  it('should return 200 and get question with answerIncludes=attachments', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await attachToAnswer(app, token, { answerId: answer.id, title: 'Answer attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, question.slug, token, { answerIncludes: 'attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('attachments')
    expect(Array.isArray(response.body.answers.items[0].attachments)).toBe(true)
  })

  it('should return 200 and get question with both include and answerIncludes', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await commentOnAnswer(app, token, { answerId: answer.id, content: 'Answer comment' })

    const response = await getQuestionBySlug(app, question.slug, token, {
      include: 'author',
      answerIncludes: 'author,comments',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('author')
    expect(response.body.answers.items[0]).toHaveProperty('comments')
  })
})
