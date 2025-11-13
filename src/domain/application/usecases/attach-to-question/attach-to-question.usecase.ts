import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/enterprise/entities/question-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToQuestionRequest = QuestionAttachmentProps

export class AttachToQuestionUseCase {
  constructor (
    private questionsRepository: QuestionsRepository,
    private questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {
    Object.freeze(this)
  }

  async execute (request: AttachToQuestionRequest): Promise<QuestionAttachment> {
    const { questionId, title, url } = request
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    const attachment = await this.questionAttachmentsRepository.create({ questionId, title, url })
    return attachment
  }
}
