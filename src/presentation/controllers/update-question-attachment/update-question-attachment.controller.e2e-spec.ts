import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { aUser } from '@tests/builders/user.builder'
import { aQuestion } from '@tests/builders/question.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createQuestionAttachment, updateQuestionAttachment } from '@tests/helpers/domain/enterprise/questions/question-attachment-requests'
import { makeApp } from '@tests/helpers/app/make-app'

describe('UpdateQuestionAttachmentController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should update question attachment and return 200', async () => {
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
    const createAttachmentResponse = await createQuestionAttachment(app, token, {
      questionId,
      title: 'Original title',
      url: 'https://example.com/original.pdf',
    })
    const attachmentId = createAttachmentResponse.body.id

    const response = await updateQuestionAttachment(app, token, {
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

    const response = await updateQuestionAttachment(app, token, {
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
