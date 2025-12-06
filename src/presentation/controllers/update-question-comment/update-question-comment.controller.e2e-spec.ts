import { INestApplication } from '@nestjs/common'
import { aQuestion } from '@tests/builders/question.builder'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { updateQuestionComment } from '@tests/helpers/domain/enterprise/comments/comment-requests'
import { commentOnQuestion } from '@tests/helpers/domain/enterprise/questions/question-comment-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

describe('UpdateQuestionComment', () => {
  let app: INestApplication
  beforeAll(async () => {
    app = await makeApp()
  })
  afterAll(async () => {
    await app.close()
  })
  it('should return 401 when no token is provided', async () => {
    const response = await updateQuestionComment(app, undefined, { commentId: 'any-id' }, { content: 'Content' })
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })
  it('should return 401 when invalid token is provided', async () => {
    const response = await updateQuestionComment(app, 'invalid-token', { commentId: 'any-id' }, { content: 'Content' })
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })
  it('should return 404 when comment does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const response = await updateQuestionComment(
      app,
      token,
      { commentId: '123e4567-e89b-12d3-a456-426614174000' },
      { content: 'Updated comment' }
    )
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Comment not found',
    })
  })
  it('should return 403 when user is not the author of the comment', async () => {
    const authorData = aUser().build()
    await createUser(app, authorData)
    const authorAuthResponse = await authenticateUser(app, {
      email: authorData.email,
      password: authorData.password,
    })
    const authorToken = authorAuthResponse.body.token
    const questionData = aQuestion().build()
    const createQuestionResponse = await createQuestion(app, authorToken, questionData)
    const questionId = createQuestionResponse.body.id
    const createCommentResponse = await commentOnQuestion(app, authorToken, {
      questionId,
      content: 'Original comment',
    })
    const commentId = createCommentResponse.body.id
    const otherUserData = aUser().build()
    await createUser(app, otherUserData)
    const otherUserAuthResponse = await authenticateUser(app, {
      email: otherUserData.email,
      password: otherUserData.password,
    })
    const otherUserToken = otherUserAuthResponse.body.token
    const response = await updateQuestionComment(
      app,
      otherUserToken,
      { commentId },
      { content: 'Updated comment' }
    )
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the comment',
    })
  })
  it('should return 200 and update question comment', async () => {
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
    const createCommentResponse = await commentOnQuestion(app, token, {
      questionId,
      content: 'Original comment',
    })
    const { id: commentId, authorId, createdAt } = createCommentResponse.body
    const response = await updateQuestionComment(app, token, { commentId }, { content: 'Updated comment' })
    expect(response.statusCode).toBe(200)
    expect(response.body.id).toBe(commentId)
    expect(response.body.content).toBe('Updated comment')
    expect(response.body.authorId).toBe(authorId)
    expect(response.body.questionId).toBe(questionId)
    expect(response.body.createdAt).toBe(createdAt)
    expect(response.body.updatedAt).toBeDefined()
  })
})
