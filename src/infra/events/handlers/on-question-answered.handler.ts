import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { NotificationJob } from '@/infra/queues/notification/notification.processor'
import { QuestionAnsweredEvent } from '@/domain/events/question-answered/question-answered.event'

@Injectable()
export class OnQuestionAnsweredHandler {
  private readonly logger = new Logger(OnQuestionAnsweredHandler.name)

  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @InjectQueue('notifications') private readonly notificationQueue: Queue<NotificationJob>
  ) {}

  @OnEvent('question.answered')
  async handle (event: QuestionAnsweredEvent): Promise<void> {
    const { answer } = event
    const question = await this.questionsRepository.findById(answer.questionId)
    if (!question) {
      this.logger.warn(`Question not found for answer ${answer.id}`)
      return
    }
    if (question.authorId === answer.authorId) {
      return
    }
    await this.notificationQueue.add('new-answer', {
      recipientId: question.authorId,
      title: `New answer on "${question.title}"`,
      content: answer.excerpt,
    })
    this.logger.log(`Queued notification for question author ${question.authorId}`)
  }
}
