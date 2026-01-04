import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswersRepository, type UpdateAnswerData } from '@/domain/application/repositories/answers.repository'
import type { Answer } from '@/domain/enterprise/entities/answer/answer.entity'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAnswerRequest = UpdateAnswerData['data'] & {
  answerId: string
  authorId: string
}

@Injectable()
export class UpdateAnswerUseCase implements UseCase {
  constructor (@Inject(AnswersRepository) private readonly answersRepository: AnswersRepository) {}

  async execute (req: UpdateAnswerRequest): Promise<Answer> {
    const { answerId, authorId, content } = req
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    if (answer.authorId !== authorId) {
      throw new NotAuthorError('answer')
    }
    const updatedAnswer = await this.answersRepository.update({
      answerId,
      data: { content },
    })
    return updatedAnswer
  }
}
