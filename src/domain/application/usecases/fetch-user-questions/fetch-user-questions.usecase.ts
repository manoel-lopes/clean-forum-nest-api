import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import { UseCase } from '@/core/domain/use-case'
import { type PaginatedQuestions, QuestionsRepository } from '@/domain/application/repositories/questions.repository'

type FetchUserQuestionsRequest = PaginationParams & {
  userId: string
}

@Injectable()
export class FetchUserQuestionsUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute ({ userId, page, pageSize, order }: FetchUserQuestionsRequest): Promise<PaginatedQuestions> {
    const questions = await this.questionsRepository.findManyByUserId(userId, { page, pageSize, order })
    return questions
  }
}
