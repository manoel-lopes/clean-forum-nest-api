import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import type { AnswerIncludeOptions, PaginatedAnswers } from './answers.repository'

export type QuestionIncludeOptions = {
  attachments?: boolean
  author?: boolean
}

export type PaginationWithIncludeParams = PaginationParams & {
  include?: QuestionIncludeOptions
}

export type UpdateQuestionData = {
  questionId: string
  data: Partial<Omit<Question, 'id' | 'createdAt' | 'updatedAt'>>
}

export type FindQuestionBySlugParams = PaginationParams & {
  slug: string
  include?: QuestionIncludeOptions
  answerIncludes?: AnswerIncludeOptions
}

export interface QuestionWithRelations extends Question {
  answers?: PaginatedAnswers
  attachments?: QuestionAttachment[]
  author?: Omit<User, 'password'>
}

export type PaginatedQuestions = Required<PaginatedItems<QuestionWithRelations>>

export type FindQuestionsResult = Question | null

export type FindManyQuestionsParams = PaginationParams & {
  include?: QuestionIncludeOptions
}

export type QuestionsRepository = {
  create(question: QuestionProps): Promise<Question>
  findById(questionId: string): Promise<Question | null>
  findByTitle(questionTitle: string): Promise<Question | null>
  findBySlug(params: FindQuestionBySlugParams): Promise<FindQuestionsResult | null>
  delete(questionId: string): Promise<void>
  update(questionData: UpdateQuestionData): Promise<Question>
  findMany(params: FindManyQuestionsParams): Promise<PaginatedQuestions>
  findManyByUserId(userId: string, paginationParams: PaginationParams): Promise<PaginatedQuestions>
}

export const QuestionsRepository = Symbol('QuestionsRepository')
