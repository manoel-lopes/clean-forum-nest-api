import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { createAnswerAttachment, updateAnswerAttachment } from '@tests/helpers/domain/enterprise/answers/answer-attachment-requests'

describe('UpdateAnswerAttachmentController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should update answer attachment and return 200', async () => {
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
    const createAttachmentResponse = await createAnswerAttachment(app, token, {
      answerId,
      title: 'Original title',
      url: 'https://example.com/original.pdf',
    })
    const attachmentId = createAttachmentResponse.body.id

    const response = await updateAnswerAttachment(app, token, {
      attachmentId,
      title: 'Updated title',
      url: 'https://example.com/updated.pdf',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title')
    expect(response.body).toHaveProperty('url')
    expect(response.body.title).toBe('Updated title')
    expect(response.body.url).toBe('https://example.com/updated.pdf')
  })

  it('should return 404 when attachment does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await updateAnswerAttachment(app, token, {
      attachmentId: 'non-existent-id',
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
