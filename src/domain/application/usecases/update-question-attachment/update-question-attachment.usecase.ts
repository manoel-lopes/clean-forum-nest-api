import type { UseCase } from '@/core/domain/application/use-case'
import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateQuestionAttachmentRequest = {
  attachmentId: string
  title?: string
  url?: string
}

export class UpdateQuestionAttachmentUseCase implements UseCase {
  constructor (private readonly questionAttachmentsRepository: QuestionAttachmentsRepository) {
    Object.freeze(this)
  }

  async execute (request: UpdateQuestionAttachmentRequest): Promise<QuestionAttachment> {
    const { attachmentId, title, url } = request
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundError('Attachment')
    }
    const updatedAttachment = await this.questionAttachmentsRepository.update(attachmentId, {
      ...(title && { title }),
      ...(url && { url }),
    })
    return updatedAttachment
  }
}
