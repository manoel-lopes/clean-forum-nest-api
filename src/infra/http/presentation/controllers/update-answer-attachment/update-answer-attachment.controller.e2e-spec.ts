import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer, fetchQuestionAnswers } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { createAnswerAttachment, updateAnswerAttachment } from '@tests/helpers/domain/enterprise/answers/answer-attachment-requests'

describe('UpdateAnswerAttachment', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await updateAnswerAttachment(app, '', {
      attachmentId: 'any-id',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await updateAnswerAttachment(app, 'invalid-token', {
      attachmentId: 'any-id',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)
    const response = await updateAnswerAttachment(app, expiredToken, {
      attachmentId: 'any-id',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 400 when title is missing', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: '123e4567-e89b-12d3-a456-426614174000',
      title: undefined,
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'The title is required',
    })
  })

  it('should return 400 when url is missing', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: undefined,
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'The url is required',
    })
  })

  it('should return 422 when attachmentId is not a valid UUID', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: 'invalid-uuid',
      title: 'Title',
      url: 'https://example.com/file.pdf',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'attachmentId' must be a valid UUID",
    })
  })

  it('should return 422 when url is not a valid URL', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: 'invalid-url',
    })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'url' is invalid",
    })
  })

  it('should update answer attachment and return 200', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    await createAnswerAttachment(app, token, {
      answerId: answer.id,
      title: 'Original title',
      url: 'https://example.com/original.pdf',
    })
    const answersWithAttachments = await fetchQuestionAnswers(app, question.id, token, { include: 'attachments' })
    const attachment = answersWithAttachments.body.items[0].attachments[0]

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: attachment.id,
      title: 'Updated title',
      url: 'https://example.com/updated.pdf',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.id).toBe(attachment.id)
    expect(response.body.title).toBe('Updated title')
    expect(response.body.url).toBe('https://example.com/updated.pdf')
    expect(response.body.createdAt).toBe(attachment.createdAt)
    expect(response.body.updatedAt).toBeDefined()
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(new Date(attachment.updatedAt).getTime())
  })

  it('should return 404 when attachment does not exist', async () => {
    const { token } = await signUp(app)

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Updated title',
      url: 'https://example.com/updated.pdf',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Attachment not found',
    })
  })
})
