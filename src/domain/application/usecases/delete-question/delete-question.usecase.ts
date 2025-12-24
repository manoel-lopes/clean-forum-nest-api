import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type DeleteQuestionRequest = {
  questionId: string
  authorId: string
}

@Injectable()
export class DeleteQuestionUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: DeleteQuestionRequest) {
    const { questionId, authorId } = req
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    if (question.authorId !== authorId) {
      throw new NotAuthorException('question')
    }
    await this.questionsRepository.delete(questionId)
  }
}
