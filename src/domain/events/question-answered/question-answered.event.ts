import type { DomainEvent } from '@/core/domain/events/domain-event'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'

export class QuestionAnsweredEvent implements DomainEvent {
  readonly eventName = 'question.answered'
  readonly occurredAt: Date

  constructor (readonly answer: Answer) {
    this.occurredAt = new Date()
  }
}
