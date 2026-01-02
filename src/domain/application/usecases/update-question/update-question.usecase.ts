import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionsRepository, type UpdateQuestionData } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateQuestionRequest = UpdateQuestionData['data'] & {
  questionId: string
  authorId: string
}

@Injectable()
export class UpdateQuestionUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: UpdateQuestionRequest): Promise<Question> {
    const { questionId, authorId, title, content } = req
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    if (question.authorId !== authorId) {
      throw new NotAuthorError('question')
    }
    const updatedQuestion = await this.questionsRepository.update({
      questionId,
      data: { title, content },
    })
    return updatedQuestion
  }
}
