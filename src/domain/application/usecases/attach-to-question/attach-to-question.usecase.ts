import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToQuestionRequest = {
  questionId: string
  title: string
  url: string
}

@Injectable()
export class AttachToQuestionUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @Inject(QuestionAttachmentsRepository) private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {}

  async execute (request: AttachToQuestionRequest): Promise<void> {
    const { questionId, title, url } = request
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    const attachment = QuestionAttachment.create({
      questionId,
      title,
      url,
    })
    await this.questionAttachmentsRepository.save(attachment)
  }
}
