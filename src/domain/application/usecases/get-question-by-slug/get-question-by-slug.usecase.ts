import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswersRepository, type PaginatedAnswers } from '@/domain/application/repositories/answers.repository'
import { type FindQuestionBySlugParams, QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type GetQuestionBySlugRequest = FindQuestionBySlugParams

type GetQuestionBySlugResponse = Omit<Question, 'answers'> & {
  answers?: PaginatedAnswers | Answer[]
}

@Injectable()
export class GetQuestionBySlugUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository
  ) {}

  async execute (request: GetQuestionBySlugRequest): Promise<GetQuestionBySlugResponse> {
    const { slug, include, answerIncludes, page, pageSize, order } = request
    const question = await this.questionsRepository.findBySlug({ slug, include })
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }

    if (answerIncludes && answerIncludes.length > 0) {
      const answers = await this.answersRepository.findManyByQuestionId({
        questionId: question.id,
        include: answerIncludes,
        page,
        pageSize,
        order,
      })
      return { ...question, answers }
    }
    return question
  }
}
