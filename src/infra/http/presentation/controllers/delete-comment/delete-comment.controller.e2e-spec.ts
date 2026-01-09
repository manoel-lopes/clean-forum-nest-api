import { INestApplication } from '@nestjs/common'

import { aQuestion } from '@tests/builders/question.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { createAnswer } from '@tests/helpers/domain/enterprise/answers/answer-requests'
import { commentOnAnswer } from '@tests/helpers/domain/enterprise/answers/answer-comment-requests'
import { deleteComment } from '@tests/helpers/domain/enterprise/comments/comment-requests'
import { createQuestion } from '@tests/helpers/domain/enterprise/questions/question-requests'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'


describe('DeleteComment', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await deleteComment(app, '', { commentId: 'any-id' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await deleteComment(app, 'invalid-token', { commentId: 'any-id' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)
    const response = await deleteComment(app, expiredToken, { commentId: 'any-id' })

    expect(response.statusCode).toBe(401)
  })

  it('should return 404 when comment does not exist', async () => {
    const { token } = await signUp(app)

    const response = await deleteComment(app, token, {
      commentId: '123e4567-e89b-12d3-a456-426614174000',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Comment not found',
    })
  })

  it('should return 403 when user is not the author of the comment', async () => {
    const { token: authorToken } = await signUp(app)
    const { body: question } = await createQuestion(app, authorToken, aQuestion().build())
    const { body: answer } = await createAnswer(app, authorToken, { questionId: question.id, content: 'Answer content' })
    const { body: comment } = await commentOnAnswer(app, authorToken, { answerId: answer.id, content: 'Comment content' })
    const { token: otherUserToken } = await signUp(app)

    const response = await deleteComment(app, otherUserToken, { commentId: comment.id })

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'The user is not the author of the comment',
    })
  })

  it('should return 204 and delete comment', async () => {
    const { token } = await signUp(app)
    const { body: question } = await createQuestion(app, token, aQuestion().build())
    const { body: answer } = await createAnswer(app, token, { questionId: question.id, content: 'Answer content' })
    const { body: comment } = await commentOnAnswer(app, token, { answerId: answer.id, content: 'Comment content' })

    const response = await deleteComment(app, token, { commentId: comment.id })

    expect(response.statusCode).toBe(204)
  })
})
