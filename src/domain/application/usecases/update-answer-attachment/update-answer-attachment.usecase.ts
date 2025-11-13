import type { UseCase } from '@/core/domain/application/use-case'
import type { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAnswerAttachmentRequest = {
  attachmentId: string
  title?: string
  url?: string
}

export class UpdateAnswerAttachmentUseCase implements UseCase {
  constructor (private readonly answerAttachmentsRepository: AnswerAttachmentsRepository) {
    Object.freeze(this)
  }

  async execute (request: UpdateAnswerAttachmentRequest): Promise<AnswerAttachment> {
    const { attachmentId, title, url } = request
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundError('Attachment')
    }
    const updatedAttachment = await this.answerAttachmentsRepository.update(attachmentId, {
      ...(title && { title }),
      ...(url && { url }),
    })
    return updatedAttachment
  }
}
