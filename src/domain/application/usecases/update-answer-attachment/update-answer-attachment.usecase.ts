import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type UpdateAnswerAttachmentRequest = {
  attachmentId: string
  title?: string
  url?: string
}

@Injectable()
export class UpdateAnswerAttachmentUseCase implements UseCase {
  constructor (
    @Inject(AnswerAttachmentsRepository) private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {}

  async execute (request: UpdateAnswerAttachmentRequest): Promise<AnswerAttachment> {
    const { attachmentId, title, url } = request
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundException('Attachment')
    }
    const updatedAttachment = await this.answerAttachmentsRepository.update(attachmentId, {
      title,
      url,
    })
    return updatedAttachment
  }
}
