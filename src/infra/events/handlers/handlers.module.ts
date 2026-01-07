import { Module } from '@nestjs/common'
import { NotificationQueueModule } from '@/infra/queues/notification/notification.queue.module'
import { OnBestAnswerChosenHandler } from './on-best-answer-chosen/on-best-answer-chosen.handler'
import { OnCommentCreatedHandler } from './on-comment-created/on-comment-created.handler'
import { OnQuestionAnsweredHandler } from './on-question-answered/on-question-answered.handler'

@Module({
  imports: [NotificationQueueModule],
  providers: [
    OnQuestionAnsweredHandler,
    OnCommentCreatedHandler,
    OnBestAnswerChosenHandler,
  ],
})
export class HandlersModule {}
