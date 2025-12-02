import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { type FindQuestionBySlugParams, QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type GetQuestionBySlugRequest = FindQuestionBySlugParams

@Injectable()
export class GetQuestionBySlugUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (request: GetQuestionBySlugRequest): Promise<Question> {
    const question = await this.questionsRepository.findBySlug(request)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    return question
  }
}
