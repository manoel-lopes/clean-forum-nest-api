import type { PaginatedItems } from '@/core/domain/paginated-items'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { Answer } from '@/domain/enterprise/entities/answer/answer.entity'
import type { ForumIncludeOption } from '@/shared/types/forum/include-option'

export type FindManyByQuestionIdParams = PaginationParams & {
  questionId: string
  include?: ForumIncludeOption[]
}

export type UpdateAnswerData = {
  answerId: string
  data: Partial<Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>>
}

export type PaginatedAnswers = Required<PaginatedItems<Answer>>

export type AnswersRepository = {
  save(answer: Answer): Promise<void>
  findById(answerId: string): Promise<Answer | null>
  delete(answerId: string): Promise<void>
  update(answerData: UpdateAnswerData): Promise<Answer>
  findManyByQuestionId(params: FindManyByQuestionIdParams): Promise<PaginatedAnswers>
}

export const AnswersRepository = Symbol('AnswersRepository')
