import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionsRepository, type UpdateQuestionData } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
      throw new ResourceNotFoundException('Question')
    }
    if (question.authorId !== authorId) {
      throw new NotAuthorException('question')
    }
    const updatedQuestion = await this.questionsRepository.update({
      where: { id: questionId },
      data: { title, content },
    })
    return updatedQuestion
  }
}
