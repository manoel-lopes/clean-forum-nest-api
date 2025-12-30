import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionBySlug, getQuestionByTile } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { attachToQuestion } from '@tests/helpers/domain/enterprise/questions/question-attachment-requests'
import { createAnswer, fetchQuestionAnswers } from '@tests/helpers/domain/enterprise/answers/answer-requests'
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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)

    const response = await getQuestionBySlug(app, question.slug, token)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title')
    expect(response.body).toHaveProperty('content')
    expect(response.body).toHaveProperty('slug')
    expect(response.body.slug).toBe(question.slug)
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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)

    const response = await getQuestionBySlug(app, question.slug, token, { include: 'author' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
    expect(response.body.author).toHaveProperty('id')
    expect(response.body.author).toHaveProperty('email')
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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await attachToQuestion(app, token, { questionId: question.id, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, question.slug, token, { include: 'attachments' })

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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await attachToQuestion(app, token, { questionId: question.id, title: 'Test attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, question.slug, token, { include: 'author,attachments' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('author')
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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })

    const response = await getQuestionBySlug(app, question.slug, token, { answerIncludes: 'author' })

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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    const answersResponse = await fetchQuestionAnswers(app, question.id, token)
    const answerId = answersResponse.body.items[0].id
    await commentOnAnswer(app, token, { answerId, content: 'Answer comment' })

    const response = await getQuestionBySlug(app, question.slug, token, { answerIncludes: 'comments' })

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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    const answersResponse = await fetchQuestionAnswers(app, question.id, token)
    const answerId = answersResponse.body.items[0].id
    await attachToAnswer(app, token, { answerId, title: 'Answer attachment', url: 'https://example.com/file.pdf' })

    const response = await getQuestionBySlug(app, question.slug, token, { answerIncludes: 'attachments' })

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
    await createQuestion(app, token, questionData)
    const question = await getQuestionByTile(app, token, questionData.title)
    await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    const answersResponse = await fetchQuestionAnswers(app, question.id, token)
    const answerId = answersResponse.body.items[0].id
    await commentOnAnswer(app, token, { answerId, content: 'Answer comment' })

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
