import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type DeleteAnswerAttachmentRequest = {
  attachmentId: string
}

@Injectable()
export class DeleteAnswerAttachmentUseCase implements UseCase {
  constructor (
    @Inject(AnswerAttachmentsRepository) private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {}

  async execute (request: DeleteAnswerAttachmentRequest) {
    const { attachmentId } = request
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundError('Attachment')
    }
    await this.answerAttachmentsRepository.delete(attachmentId)
  }
}
