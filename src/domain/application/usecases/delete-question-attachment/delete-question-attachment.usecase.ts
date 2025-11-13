import type { UseCase } from '@/core/domain/application/use-case'
import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type DeleteQuestionAttachmentRequest = {
  attachmentId: string
}

export class DeleteQuestionAttachmentUseCase implements UseCase {
  constructor (private readonly questionAttachmentsRepository: QuestionAttachmentsRepository) {
    Object.freeze(this)
  }

  async execute (request: DeleteQuestionAttachmentRequest) {
    const { attachmentId } = request
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundError('Attachment')
    }
    await this.questionAttachmentsRepository.delete(attachmentId)
  }
}
