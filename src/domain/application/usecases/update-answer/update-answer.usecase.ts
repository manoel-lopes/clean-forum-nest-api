import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository, type UpdateAnswerData } from '@/domain/application/repositories/answers.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAnswerRequest = UpdateAnswerData['data'] & {
  answerId: string
}

@Injectable()
export class UpdateAnswerUseCase implements UseCase {
  constructor (@Inject(AnswersRepository) private readonly answersRepository: AnswersRepository) {
    Object.freeze(this)
  }

  async execute (req: UpdateAnswerRequest): Promise<Answer> {
    const { answerId, content } = req
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const updatedAnswer = await this.answersRepository.update({
      where: { id: answerId },
      data: { content },
    })
    return updatedAnswer
  }
}
