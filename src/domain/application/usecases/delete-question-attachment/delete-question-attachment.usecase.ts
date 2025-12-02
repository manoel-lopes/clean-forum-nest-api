import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type DeleteQuestionAttachmentRequest = {
  attachmentId: string
}

@Injectable()
export class DeleteQuestionAttachmentUseCase implements UseCase {
  constructor (
    @Inject(QuestionAttachmentsRepository) private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {}

  async execute (request: DeleteQuestionAttachmentRequest) {
    const { attachmentId } = request
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (!attachment) {
      throw new ResourceNotFoundException('Attachment')
    }
    await this.questionAttachmentsRepository.delete(attachmentId)
  }
}
