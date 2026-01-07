import type { INestApplication } from '@nestjs/common'

import { createAuthenticatedUser } from './authenticated-user'
import { createQuestionAs } from './question'
import { createAnswerOn } from './answer'
import { createCommentOn } from './comment'
import type {
  AuthenticatedUserResult,
  QuestionResult,
  AnswerResult,
  CommentResult,
} from './types'

export type ScenarioWithQuestion = {
  author: AuthenticatedUserResult
  question: QuestionResult
}

export type ScenarioWithAnswer = ScenarioWithQuestion & {
  answer: AnswerResult
}

export type ScenarioWithComment = ScenarioWithAnswer & {
  comment: CommentResult
}

export async function createScenarioWithQuestion (
  app: INestApplication
): Promise<ScenarioWithQuestion> {
  const author = await createAuthenticatedUser(app)
  const question = await createQuestionAs(app, author.token)

  return { author, question }
}

export async function createScenarioWithAnswer (
  app: INestApplication
): Promise<ScenarioWithAnswer> {
  const { author, question } = await createScenarioWithQuestion(app)
  const answer = await createAnswerOn(app, author.token, question.id)

  return { author, question, answer }
}

export async function createScenarioWithComment (
  app: INestApplication
): Promise<ScenarioWithComment> {
  const { author, question, answer } = await createScenarioWithAnswer(app)
  const comment = await createCommentOn(app, author.token, answer.id, question.id)

  return { author, question, answer, comment }
}
