import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionBySlug } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { commentOnQuestion } from '@tests/helpers/domain/enterprise/questions/question-comment-requests'
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
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await getQuestionBySlug(app, 'non-existent-slug', token)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Question not found',
    })
  })

  it('should return 200 and get question by slug', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createResponse = await createQuestion(app, token, questionData)
    const slug = createResponse.body.slug

    const response = await getQuestionBySlug(app, slug, token)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title')
    expect(response.body).toHaveProperty('content')
    expect(response.body).toHaveProperty('slug')
    expect(response.body.slug).toBe(slug)
  })

  it('should return 200 and get question with include=author', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const questionData = aQuestion().build()
    const createResponse = await createQuestion(app, token, questionData)
    const slug = createResponse.body.slug

    const response = await getQuestionBySlug(app, slug, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body.author).toHaveProperty('id')
    expect(response.body.author).toHaveProperty('email')
  })

  it('should return 200 and get question with include=comments', async () => {
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
    const slug = createResponse.body.slug
    await commentOnQuestion(app, token, { questionId, content: 'Test comment' })

    const response = await getQuestionBySlug(app, slug, token, { include: 'comments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('comments')
    expect(Array.isArray(response.body.comments)).toBe(true)
    expect(response.body.comments.length).toBeGreaterThan(0)
  })

  it('should return 200 and get question with include=attachments', async () => {
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
    const slug = createResponse.body.slug
    await attachToQuestion(app, token, { questionId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, slug, token, { include: 'attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('attachments')
    expect(Array.isArray(response.body.attachments)).toBe(true)
    expect(response.body.attachments.length).toBeGreaterThan(0)
  })

  it('should return 200 and get question with multiple include options', async () => {
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
    const slug = createResponse.body.slug
    await commentOnQuestion(app, token, { questionId, content: 'Test comment' })
    await attachToQuestion(app, token, { questionId, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, slug, token, { include: 'author,comments,attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body).toHaveProperty('comments')
    expect(response.body).toHaveProperty('attachments')
  })

  it('should return 200 and get question with answerIncludes=author', async () => {
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
    const slug = createResponse.body.slug
    await createAnswer(app, token, { questionId, content: 'Answer content' })

    const response = await getQuestionBySlug(app, slug, token, { answerIncludes: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('author')
  })

  it('should return 200 and get question with answerIncludes=comments', async () => {
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
    const slug = createResponse.body.slug
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    await commentOnAnswer(app, token, { answerId, content: 'Answer comment' })

    const response = await getQuestionBySlug(app, slug, token, { answerIncludes: 'comments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('comments')
    expect(Array.isArray(response.body.answers.items[0].comments)).toBe(true)
  })

  it('should return 200 and get question with answerIncludes=attachments', async () => {
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
    const slug = createResponse.body.slug
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    await attachToAnswer(app, token, { answerId, title: 'Answer attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, slug, token, { answerIncludes: 'attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('attachments')
    expect(Array.isArray(response.body.answers.items[0].attachments)).toBe(true)
  })

  it('should return 200 and get question with both include and answerIncludes', async () => {
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
    const slug = createResponse.body.slug
    await commentOnQuestion(app, token, { questionId, content: 'Question comment' })
    const createAnswerResponse = await createAnswer(app, token, { questionId, content: 'Answer content' })
    const answerId = createAnswerResponse.body.id
    await commentOnAnswer(app, token, { answerId, content: 'Answer comment' })

    const response = await getQuestionBySlug(app, slug, token, {
      include: 'author,comments',
      answerIncludes: 'author,comments',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body).toHaveProperty('comments')
    expect(response.body).toHaveProperty('answers')
    expect(response.body.answers.items[0]).toHaveProperty('author')
    expect(response.body.answers.items[0]).toHaveProperty('comments')
  })
})
