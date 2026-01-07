import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { Comment } from '@/domain/enterprise/entities/comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'

export type AnswerIncludeOptions = {
  comments?: boolean
  attachments?: boolean
  author?: boolean
}

export type FindManyByQuestionIdParams = PaginationParams & {
  questionId: string
  include?: AnswerIncludeOptions
}

export type UpdateAnswerData = {
  answerId: string
  data: Partial<Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>>
}

export interface AnswerWithRelations extends Answer {
  comments?: Comment[]
  attachments?: AnswerAttachment[]
  author?: Omit<User, 'password'>
}

export type PaginatedAnswers = Required<PaginatedItems<AnswerWithRelations>>

export type AnswersRepository = {
  create(answer: AnswerProps): Promise<Answer>
  findById(answerId: string): Promise<Answer | null>
  delete(answerId: string): Promise<void>
  update(answerData: UpdateAnswerData): Promise<Answer>
  findManyByQuestionId(params: FindManyByQuestionIdParams): Promise<PaginatedAnswers>
}

export const AnswersRepository = Symbol('AnswersRepository')
