import type { UseCase } from '@/core/domain/application/use-case'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type ChooseQuestionBestAnswerRequest = {
  authorId: string
  answerId: string
}

export type ChooseQuestionBestAnswerResponse = Omit<Question, 'answers'>

export class ChooseQuestionBestAnswerUseCase implements UseCase {
  constructor (
    private readonly questionsRepository: QuestionsRepository,
    private readonly answersRepository: AnswersRepository
  ) {
    Object.freeze(this)
  }

  async execute ({ answerId, authorId }: ChooseQuestionBestAnswerRequest): Promise<ChooseQuestionBestAnswerResponse> {
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
    const editedQuestion = await this.questionsRepository.update({
      where: { id: question.id },
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
