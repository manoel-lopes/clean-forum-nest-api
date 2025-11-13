import type { UseCase } from '@/core/domain/application/use-case'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type DeleteAnswerRequest = {
  answerId: string
  authorId: string
}

export class DeleteAnswerUseCase implements UseCase {
  constructor (private readonly answersRepository: AnswersRepository) {}

  async execute (req: DeleteAnswerRequest) {
    const { answerId, authorId } = req
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    if (answer.authorId !== authorId) {
      throw new NotAuthorError('answer')
    }
    await this.answersRepository.delete(answerId)
  }
}
