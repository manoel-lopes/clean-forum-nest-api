import type { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToAnswerRequest = AnswerAttachmentProps

export class AttachToAnswerUseCase {
  constructor (
    private answersRepository: AnswersRepository,
    private answerAttachmentsRepository: AnswerAttachmentsRepository
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
