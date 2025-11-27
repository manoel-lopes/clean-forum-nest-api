import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import { UseCase } from '@/core/domain/application/use-case'
import { type PaginatedQuestions, QuestionsRepository } from '@/domain/application/repositories/questions.repository'

type FetchUserQuestionsRequest = PaginationParams & {
  userId: string
}

@Injectable()
export class FetchUserQuestionsUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {
    Object.freeze(this)
  }

  async execute ({ userId, page, pageSize, order }: FetchUserQuestionsRequest): Promise<PaginatedQuestions> {
    const questions = await this.questionsRepository.findManyByUserId(userId, { page, pageSize, order })
    return questions
  }
}
