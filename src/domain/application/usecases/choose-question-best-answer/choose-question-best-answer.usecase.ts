import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { PrimitiveAndDates } from '@/shared/types/custom/primitive-and-dates'

type ChooseQuestionBestAnswerRequest = {
  authorId: string
  answerId: string
}

export type ChooseQuestionBestAnswerResponse = PrimitiveAndDates<Question>

@Injectable()
export class ChooseQuestionBestAnswerUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository
  ) {}

  async execute ({
    answerId,
    authorId
  }: ChooseQuestionBestAnswerRequest): Promise<ChooseQuestionBestAnswerResponse> {
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const question = await this.questionsRepository.findById(answer.questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    if (authorId !== question.authorId) {
      throw new NotAuthorError('question')
    }
    if (question.bestAnswerId === answer.id) {
      return question
    }
    const editedQuestion = await this.questionsRepository.update({
      questionId: question.id,
      data: { bestAnswerId: answer.id },
    })
    return editedQuestion
  }
}
