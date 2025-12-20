import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
      throw new ResourceNotFoundException('Answer')
    }
    const attachment = AnswerAttachment.create({
      answerId,
      title,
      url,
    })
    await this.answerAttachmentsRepository.save(attachment)
  }
}
