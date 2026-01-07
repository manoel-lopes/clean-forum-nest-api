import type { DomainEvent } from './domain-event'

export interface DomainEventEmitter {
  emit<T extends DomainEvent>(event: T): void
}

export const DomainEventEmitter = Symbol('DomainEventEmitter')
