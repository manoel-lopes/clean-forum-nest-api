import type { INestApplication } from '@nestjs/common'

import {
  createAnswer,
  fetchQuestionAnswers,
} from '@tests/helpers/domain/enterprise/answers/answer-requests'

import type { AnswerResult, CreateAnswerOptions } from './types'

const DEFAULT_ANSWER_CONTENT = 'Test answer content for e2e tests'

export async function createAnswerOn (
  app: INestApplication,
  token: string,
  questionId: string,
  options?: CreateAnswerOptions
): Promise<AnswerResult> {
  const content = options?.content ?? DEFAULT_ANSWER_CONTENT

  const createResponse = await createAnswer(app, token, {
    questionId,
    content,
  })
  if (createResponse.statusCode !== 201) {
    throw new Error(`Failed to create answer: ${JSON.stringify(createResponse.body)}`)
  }

  const answersResponse = await fetchQuestionAnswers(app, questionId, token, { order: 'desc' })
  if (answersResponse.statusCode !== 200) {
    throw new Error(`Failed to fetch answers: ${JSON.stringify(answersResponse.body)}`)
  }

  const items = answersResponse.body.items
  if (!items || items.length === 0) {
    throw new Error('No answers found after creation')
  }

  return items[0]
}
