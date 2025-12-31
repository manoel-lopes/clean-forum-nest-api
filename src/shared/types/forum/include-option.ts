import { AnswerIncludeOptions } from '@/domain/application/repositories/answers.repository'
import { QuestionIncludeOptions } from '@/domain/application/repositories/questions.repository'

export type ForumIncludeOptions = QuestionIncludeOptions | AnswerIncludeOptions
