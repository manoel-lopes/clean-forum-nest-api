import type { DomainEvent } from '@/core/domain/events/domain-event'
import type { Question } from '@/domain/enterprise/entities/question.entity'

export class BestAnswerChosenEvent implements DomainEvent {
  readonly eventName = 'question.best-answer-chosen'
  readonly occurredAt: Date

  constructor (
    readonly question: Question,
    readonly answerId: string
  ) {
    this.occurredAt = new Date()
  }
}
