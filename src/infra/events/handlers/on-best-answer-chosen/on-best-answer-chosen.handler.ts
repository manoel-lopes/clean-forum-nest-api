import { InjectQueue } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import type { EventHandler } from '@/core/domain/events/event-handler'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { NotificationQueue } from '@/infra/queues/notification/notification-queue.port'
import { BestAnswerChosenEvent } from '@/domain/events/best-answer-chosen/best-answer-chosen.event'

@Injectable()
export class OnBestAnswerChosenHandler implements EventHandler<BestAnswerChosenEvent> {
  private readonly logger = new Logger(OnBestAnswerChosenHandler.name)

  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @InjectQueue('notifications') private readonly notificationQueue: NotificationQueue
  ) {}

  @OnEvent('question.best-answer-chosen')
  async handle (event: BestAnswerChosenEvent): Promise<void> {
    const { question, answerId } = event
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      this.logger.warn(`Answer not found: ${answerId}`)
      return
    }
    if (question.authorId === answer.authorId) return
    await this.notificationQueue.add('best-answer', {
      recipientId: answer.authorId,
      title: 'Your answer was chosen as best!',
      content: `Your answer to "${question.title}" was selected as the best answer.`,
    })
    this.logger.log(`Queued notification for answer author ${answer.authorId}`)
  }
}
