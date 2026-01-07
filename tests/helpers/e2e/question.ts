import type { INestApplication } from '@nestjs/common'

import { aQuestion } from '@tests/builders/question.builder'
import {
  createQuestion,
  getQuestionByTile,
} from '@tests/helpers/domain/enterprise/questions/question-requests'

import type { QuestionResult, CreateQuestionOptions } from './types'

export async function createQuestionAs (
  app: INestApplication,
  token: string,
  options?: CreateQuestionOptions
): Promise<QuestionResult> {
  const builder = aQuestion()
  if (options?.title) builder.withTitle(options.title)
  if (options?.content) builder.withContent(options.content)

  const questionData = builder.build()

  const createResponse = await createQuestion(app, token, questionData)
  if (createResponse.statusCode !== 201) {
    throw new Error(`Failed to create question: ${JSON.stringify(createResponse.body)}`)
  }

  const question = await getQuestionByTile(app, token, questionData.title)
  return question
}
