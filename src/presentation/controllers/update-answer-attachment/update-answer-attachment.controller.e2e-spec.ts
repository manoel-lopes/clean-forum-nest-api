import { INestApplication } from '@nestjs/common'
import { aQuestion } from '@tests/builders/question.builder'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { createAnswerAttachment, updateAnswerAttachment } from '@tests/helpers/domain/enterprise/answers/answer-attachment-requests'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

describe('UpdateAnswerAttachment', () => {
  let app: INestApplication
  beforeAll(async () => {
    app = await makeApp()
  })
  afterAll(async () => {
    await app.close()
  })
  it('should return 401 when no token is provided', async () => {
    const response = await updateAnswerAttachment(app, undefined, {
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
  it('should return 400 when title is missing', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
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
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
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
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
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
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const response = await updateAnswerAttachment(app, token, {
      attachmentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Title',
      url: 'invalid-url',
    })
    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'url' must be a valid URL",
    })
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
