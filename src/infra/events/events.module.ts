import { Global, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { DomainEventEmitter } from '@/core/domain/events/domain-event-emitter'
import { NestJsDomainEventEmitter } from './nestjs-domain-event-emitter'

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    {
      provide: DomainEventEmitter,
      useClass: NestJsDomainEventEmitter,
    },
  ],
  exports: [DomainEventEmitter],
})
export class EventsModule {}
