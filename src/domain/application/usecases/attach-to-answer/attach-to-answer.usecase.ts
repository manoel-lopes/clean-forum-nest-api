import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToAnswerRequest = AnswerAttachmentProps

@Injectable()
export class AttachToAnswerUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(AnswerAttachmentsRepository) private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {
    Object.freeze(this)
  }

  async execute (request: AttachToAnswerRequest): Promise<AnswerAttachment> {
    const { answerId, title, url } = request
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const attachment = await this.answerAttachmentsRepository.create({ answerId, title, url })
    return attachment
  }
}
