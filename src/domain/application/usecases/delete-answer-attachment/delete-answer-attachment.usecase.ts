import type { UseCase } from '@/core/domain/application/use-case'
import type { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type DeleteAnswerAttachmentRequest = {
  attachmentId: string
}

export class DeleteAnswerAttachmentUseCase implements UseCase {
  constructor (private readonly answerAttachmentsRepository: AnswerAttachmentsRepository) {
    Object.freeze(this)
  }

  async execute (request: DeleteAnswerAttachmentRequest) {
    const { attachmentId } = request
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundError('Attachment')
    }
    await this.answerAttachmentsRepository.delete(attachmentId)
  }
}
