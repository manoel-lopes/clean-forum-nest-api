import { InjectQueue } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import type { EventHandler } from '@/core/domain/events/event-handler'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { NotificationQueue } from '@/infra/queues/notification/notification-queue.port'
import { CommentCreatedEvent } from '@/domain/events/comment-created/comment-created.event'

@Injectable()
export class OnCommentCreatedHandler implements EventHandler<CommentCreatedEvent> {
  private readonly logger = new Logger(OnCommentCreatedHandler.name)

  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @InjectQueue('notifications') private readonly notificationQueue: NotificationQueue
  ) {}

  @OnEvent('comment.created')
  async handle (event: CommentCreatedEvent): Promise<void> {
    const { comment } = event
    const answer = await this.answersRepository.findById(comment.answerId)
    if (!answer) {
      this.logger.warn(`Answer not found for comment ${comment.id}`)
      return
    }
    if (answer.authorId === comment.authorId) return
    const contentSnippet = comment.content.length > 100
      ? comment.content.substring(0, 100).concat('...')
      : comment.content
    await this.notificationQueue.add('new-comment', {
      recipientId: answer.authorId,
      title: 'New comment on your answer',
      content: contentSnippet,
    })
    this.logger.log(`Queued notification for answer author ${answer.authorId}`)
  }
}
