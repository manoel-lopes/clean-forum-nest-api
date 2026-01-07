import type { DomainEvent } from '@/core/domain/events/domain-event'
import type { Comment } from '@/domain/enterprise/entities/comment.entity'

export class CommentCreatedEvent implements DomainEvent {
  readonly eventName = 'comment.created'
  readonly occurredAt: Date

  constructor (readonly comment: Comment) {
    this.occurredAt = new Date()
  }
}
