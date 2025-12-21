import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type ChooseQuestionBestAnswerRequest = {
  authorId: string
  answerId: string
}

export type ChooseQuestionBestAnswerResponse = Omit<Question, 'answers' | 'comments' | 'attachments' | 'author'>

@Injectable()
export class ChooseQuestionBestAnswerUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository
  ) {}

  async execute ({ answerId, authorId }: ChooseQuestionBestAnswerRequest): Promise<ChooseQuestionBestAnswerResponse> {
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundException('Answer')
    }
    const question = await this.questionsRepository.findById(answer.questionId)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    if (authorId !== question.authorId) {
      throw new NotAuthorException('question')
    }
    const editedQuestion = await this.questionsRepository.update({
      questionId: question.id,
      data: { bestAnswerId: answer.id },
    })
    return {
      id: editedQuestion.id,
      title: editedQuestion.title,
      content: editedQuestion.content,
      slug: editedQuestion.slug,
      authorId: editedQuestion.authorId,
      bestAnswerId: editedQuestion.bestAnswerId,
      createdAt: editedQuestion.createdAt,
      updatedAt: editedQuestion.updatedAt,
    }
  }
}
