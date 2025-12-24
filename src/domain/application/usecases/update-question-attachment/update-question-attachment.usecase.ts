import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type UpdateQuestionAttachmentRequest = {
  attachmentId: string
  title?: string
  url?: string
}

@Injectable()
export class UpdateQuestionAttachmentUseCase implements UseCase {
  constructor (
    @Inject(QuestionAttachmentsRepository) private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {}

  async execute (request: UpdateQuestionAttachmentRequest): Promise<QuestionAttachment> {
    const { attachmentId, title, url } = request
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundException('Attachment')
    }
    const updatedAttachment = await this.questionAttachmentsRepository.update(attachmentId, {
      title,
      url,
    })
    return updatedAttachment
  }
}
