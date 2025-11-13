import type { UseCase } from '@/core/domain/application/use-case'
import type {
  FindQuestionBySlugParams,
  QuestionsRepository,
} from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type GetQuestionBySlugRequest = FindQuestionBySlugParams

export class GetQuestionBySlugUseCase implements UseCase {
  constructor (private readonly questionsRepository: QuestionsRepository) {}

  async execute (request: GetQuestionBySlugRequest): Promise<Question> {
    const question = await this.questionsRepository.findBySlug(request)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    return question
  }
}
