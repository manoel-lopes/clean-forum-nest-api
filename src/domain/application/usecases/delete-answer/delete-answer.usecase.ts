import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type DeleteAnswerRequest = {
  answerId: string
  authorId: string
}

@Injectable()
export class DeleteAnswerUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository
  ) {}

  async execute (req: DeleteAnswerRequest) {
    const { answerId, authorId } = req
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundException('Answer')
    }
    if (answer.authorId !== authorId) {
      throw new NotAuthorException('answer')
    }
    await this.answersRepository.delete(answerId)
  }
}
