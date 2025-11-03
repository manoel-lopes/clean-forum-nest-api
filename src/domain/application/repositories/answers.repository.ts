import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'

export type FindManyByQuestionIdParams = PaginationParams & {
  questionId: string
  include?: AnswerIncludeOption[]
}

export type UpdateAnswerData = {
  where: { id: string }
  data: Partial<Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>>
}

export type AnswerWithRelations = Answer & {
  comments?: AnswerComment[]
  attachments?: AnswerAttachment[]
  author?: Omit<User, 'password'>
}

export type PaginatedAnswers = Required<PaginatedItems<AnswerWithRelations>>

export type AnswerIncludeOption = 'comments' | 'attachments' | 'author'

export type AnswersRepository = {
  create(answer: AnswerProps): Promise<Answer>
  findById(answerId: string): Promise<Answer | null>
  delete(answerId: string): Promise<void>
  update(answerData: UpdateAnswerData): Promise<Answer>
  findManyByQuestionId(params: FindManyByQuestionIdParams): Promise<PaginatedAnswers>
}
