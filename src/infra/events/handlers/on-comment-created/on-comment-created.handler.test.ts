import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-comments.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { CommentCreatedEvent } from '@/domain/events/comment-created/comment-created.event'
import { OnCommentCreatedHandler } from './on-comment-created.handler'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { makeCommentData } from '@tests/factories/domain/make-comment'
import { MockNotificationQueue } from '@tests/mocks/notification-queue.mock'

describe('OnCommentCreatedHandler', () => {
  let sut: OnCommentCreatedHandler
  let answersRepository: AnswersRepository
  let commentsRepository: CommentsRepository
  let notificationQueue: MockNotificationQueue

  beforeEach(() => {
    commentsRepository = new InMemoryCommentsRepository()
    answersRepository = new InMemoryAnswersRepository()
    notificationQueue = new MockNotificationQueue()
    sut = new OnCommentCreatedHandler(answersRepository, notificationQueue)
  })

  it('should not queue notification when answer is not found', async () => {
    const comment = await commentsRepository.create(makeCommentData({
      answerId: 'non-existent-answer'
    }))
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should not queue notification when author comments on their own answer', async () => {
    const authorId = 'same-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId })
    )
    const comment = await commentsRepository.create(makeCommentData({
      answerId: answer.id,
      authorId
    }))
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should queue notification for answer author when different user comments', async () => {
    const answerAuthorId = 'answer-author-id'
    const commentAuthorId = 'comment-author-id'
    const answer = await answersRepository.create(
      makeAnswerData({ authorId: answerAuthorId })
    )
    const comment = await commentsRepository.create(makeCommentData({
      answerId: answer.id,
      authorId: commentAuthorId,
    }))
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(1)
    const job = notificationQueue.findJob('new-comment')
    expect(job).not.toBeNull()
    expect(job?.data.recipientId).toBe(answerAuthorId)
    expect(job?.data.title).toBe('New comment on your answer')
    expect(job?.data.content).toBe(comment.content)
  })

  it('should truncate long comment content to 100 characters', async () => {
    const answerAuthorId = 'answer-author-id'
    const commentAuthorId = 'comment-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId: answerAuthorId })
    )
    const longContent = 'a'.repeat(150)
    const comment = await commentsRepository.create(makeCommentData({
      answerId: answer.id,
      authorId: commentAuthorId,
      content: longContent,
    }))
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    const job = notificationQueue.findJob('new-comment')
    expect(job?.data.content).toBe(comment.content.substring(0, 100).concat('...'))
  })
})
