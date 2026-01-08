import type { INestApplication } from '@nestjs/common'

import { commentOnAnswer } from '@tests/helpers/domain/enterprise/answers/answer-comment-requests'
import { fetchQuestionAnswers } from '@tests/helpers/domain/enterprise/answers/answer-requests'

import type { CommentResult, CreateCommentOptions } from './types'

const DEFAULT_COMMENT_CONTENT = 'Test comment content for e2e tests'

type AnswerWithComments = {
  id: string
  comments?: CommentResult[]
}

export async function createCommentOn (
  app: INestApplication,
  token: string,
  answerId: string,
  questionId: string,
  options?: CreateCommentOptions
): Promise<CommentResult> {
  const content = options?.content ?? DEFAULT_COMMENT_CONTENT

  const createResponse = await commentOnAnswer(app, token, {
    answerId,
    content,
  })
  if (createResponse.statusCode !== 201) {
    throw new Error(`Failed to create comment: ${JSON.stringify(createResponse.body)}`)
  }

  const answersResponse = await fetchQuestionAnswers(app, questionId, token, {
    include: 'comments',
  })
  if (answersResponse.statusCode !== 200) {
    throw new Error(`Failed to fetch answers with comments: ${JSON.stringify(answersResponse.body)}`)
  }

  const answerWithComments = answersResponse.body.items.find(
    (a: AnswerWithComments) => a.id === answerId
  )
  if (!answerWithComments || !answerWithComments.comments) {
    throw new Error('Answer or comments not found')
  }

  const comment = answerWithComments.comments.find(
    (c: CommentResult) => c.content === content
  )
  if (!comment) {
    throw new Error('Created comment not found')
  }

  return comment
}
