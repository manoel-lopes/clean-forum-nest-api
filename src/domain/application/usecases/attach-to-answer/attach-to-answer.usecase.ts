import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToAnswerRequest = {
  answerId: string
  title: string
  url: string
}

@Injectable()
export class AttachToAnswerUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(AnswerAttachmentsRepository) private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {}

  async execute (request: AttachToAnswerRequest): Promise<void> {
    const { answerId, title, url } = request
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const attachment = AnswerAttachment.create({
      answerId,
      title,
      url,
    })
    await this.answerAttachmentsRepository.save(attachment)
  }
}
