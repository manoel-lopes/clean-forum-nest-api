import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { DomainEvent } from '@/core/domain/events/domain-event'
import type { DomainEventEmitter } from '@/core/domain/events/domain-event-emitter'

@Injectable()
export class NestJsDomainEventEmitter implements DomainEventEmitter {
  constructor (private readonly eventEmitter: EventEmitter2) {}

  emit<T extends DomainEvent> (event: T): void {
    this.eventEmitter.emit(event.eventName, event)
  }
}
