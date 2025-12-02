import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository, type UpdateAnswerData } from '@/domain/application/repositories/answers.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
      throw new ResourceNotFoundException('Answer')
    }
    if (answer.authorId !== authorId) {
      throw new NotAuthorException('answer')
    }
    const updatedAnswer = await this.answersRepository.update({
      where: { id: answerId },
      data: { content },
    })
    return updatedAnswer
  }
}
