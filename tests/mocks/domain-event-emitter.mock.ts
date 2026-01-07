import type { DomainEvent } from '@/core/domain/events/domain-event'
import type { DomainEventEmitter } from '@/core/domain/events/domain-event-emitter'

export class MockDomainEventEmitter implements DomainEventEmitter {
  readonly emittedEvents: DomainEvent[] = []

  emit<T extends DomainEvent> (event: T): void {
    this.emittedEvents.push(event)
  }

  clear (): void {
    this.emittedEvents.length = 0
  }

  findEvent<T extends DomainEvent> (eventName: string): T | null {
    return (this.emittedEvents.find(e => e.eventName === eventName) ?? null) as T | null
  }
}
