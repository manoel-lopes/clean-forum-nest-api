import type { PaginatedItems } from '@/core/domain/paginated-items'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { Question } from '@/domain/enterprise/entities/question/question.entity'
import type { ForumIncludeOption } from '@/shared/types/forum/include-option'

export type PaginationWithIncludeParams = PaginationParams & {
  include?: ForumIncludeOption[]
}

export type UpdateQuestionData = {
  questionId: string
  data: Partial<Omit<Question, 'id' | 'createdAt' | 'updatedAt'>>
}

export type FindQuestionBySlugParams = PaginationParams & {
  slug: string
  include?: ForumIncludeOption[]
  answerIncludes?: ForumIncludeOption[]
}

export type PaginatedQuestions = Required<PaginatedItems<Question>>

export type FindQuestionsResult = Question | null

export type FindManyQuestionsParams = PaginationParams & {
  include?: ForumIncludeOption[]
}

export type QuestionsRepository = {
  save(question: Question): Promise<void>
  findById(questionId: string): Promise<Question | null>
  findByTitle(questionTitle: string): Promise<Question | null>
  findBySlug(params: FindQuestionBySlugParams): Promise<FindQuestionsResult | null>
  delete(questionId: string): Promise<void>
  update(questionData: UpdateQuestionData): Promise<Question>
  findMany(params: FindManyQuestionsParams): Promise<PaginatedQuestions>
  findManyByUserId(userId: string, paginationParams: PaginationParams): Promise<PaginatedQuestions>
}

export const QuestionsRepository = Symbol('QuestionsRepository')
