import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswersRepository, type FindManyByQuestionIdParams, type PaginatedAnswers } from '@/domain/application/repositories/answers.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type FetchQuestionAnswersRequest = FindManyByQuestionIdParams

@Injectable()
export class FetchQuestionAnswersUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: FetchQuestionAnswersRequest): Promise<PaginatedAnswers> {
    const question = await this.questionsRepository.findById(req.questionId)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    const answers = await this.answersRepository.findManyByQuestionId(req)
    return answers
  }
}
