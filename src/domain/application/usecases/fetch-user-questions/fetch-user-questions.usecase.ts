import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UseCase } from '@/core/domain/application/use-case'
import type {
  PaginatedQuestions,
  QuestionsRepository,
} from '@/domain/application/repositories/questions.repository'

type FetchUserQuestionsRequest = PaginationParams & {
  userId: string
}

export class FetchUserQuestionsUseCase implements UseCase {
  constructor (private readonly questionsRepository: QuestionsRepository) {
    Object.freeze(this)
  }

  async execute ({ userId, page, pageSize, order }: FetchUserQuestionsRequest): Promise<PaginatedQuestions> {
    const questions = await this.questionsRepository.findManyByUserId(userId, { page, pageSize, order })
    return questions
  }
}
