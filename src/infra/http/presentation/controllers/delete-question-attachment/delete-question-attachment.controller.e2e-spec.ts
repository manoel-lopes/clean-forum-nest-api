import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aQuestion } from '@tests/builders/question.builder'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion, getQuestionBySlug } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createQuestionAttachment, deleteQuestionAttachment } from '@tests/helpers/domain/enterprise/questions/question-attachment-requests'

describe('DeleteQuestionAttachment', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await deleteQuestionAttachment(app, '', 'any-id')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await deleteQuestionAttachment(app, 'invalid-token', 'any-id')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)

    const response = await deleteQuestionAttachment(app, expiredToken, 'any-id')

    expect(response.statusCode).toBe(401)
  })

  it('should return 422 when attachmentId is not a valid UUID', async () => {
    const { token } = await signUp(app)

    const response = await deleteQuestionAttachment(app, token, 'invalid-uuid')

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'attachmentId' must be a valid UUID",
    })
  })

  it('should delete question attachment and return 204', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    await createQuestionAttachment(app, token, {
      questionId: question.id,
      title: 'Attachment title',
      url: 'https://example.com/file.pdf',
    })
    const questionWithAttachments = await getQuestionBySlug(app, question.slug, token, { include: 'attachments' })
    const attachmentId = questionWithAttachments.body.attachments[0].id

    const response = await deleteQuestionAttachment(app, token, attachmentId)

    expect(response.statusCode).toBe(204)
  })

  it('should return 404 when attachment does not exist', async () => {
    const { token } = await signUp(app)

    const response = await deleteQuestionAttachment(app, token, '123e4567-e89b-12d3-a456-426614174000')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Attachment not found',
    })
  })
})
