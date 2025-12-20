import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
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

  async execute (request: UpdateQuestionAttachmentRequest): Promise<Attachment> {
    const { attachmentId, title, url } = request
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundException('Attachment')
    }
    const updatedAttachment = await this.questionAttachmentsRepository.update(attachmentId, {
      ...(title && { title }),
      ...(url && { url }),
    })
    return updatedAttachment
  }
}
