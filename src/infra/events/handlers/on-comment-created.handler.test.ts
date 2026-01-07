import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import type { Comment } from '@/domain/enterprise/entities/comment.entity'
import { CommentCreatedEvent } from '@/domain/events/comment-created/comment-created.event'
import { OnCommentCreatedHandler } from './on-comment-created.handler'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { makeCommentData } from '@tests/factories/domain/make-comment'
import { MockNotificationQueue } from '@tests/mocks/notification-queue.mock'

describe('OnCommentCreatedHandler', () => {
  let sut: OnCommentCreatedHandler
  let answersRepository: AnswersRepository
  let notificationQueue: MockNotificationQueue

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    notificationQueue = new MockNotificationQueue()
    // @ts-expect-error - mock queue for testing
    sut = new OnCommentCreatedHandler(answersRepository, notificationQueue)
  })

  it('should not queue notification when answer is not found', async () => {
    const comment: Comment = {
      id: 'comment-1',
      ...makeCommentData({ answerId: 'non-existent-answer' }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should not queue notification when author comments on their own answer', async () => {
    const authorId = 'same-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId })
    )
    const comment: Comment = {
      id: 'comment-1',
      ...makeCommentData({ answerId: answer.id, authorId }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should queue notification for answer author when different user comments', async () => {
    const answerAuthorId = 'answer-author-id'
    const commentAuthorId = 'comment-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId: answerAuthorId })
    )
    const comment: Comment = {
      id: 'comment-1',
      ...makeCommentData({ answerId: answer.id, authorId: commentAuthorId, content: 'Short comment' }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(1)
    const job = notificationQueue.findJob('new-comment')
    expect(job).not.toBeNull()
    expect(job?.data.recipientId).toBe(answerAuthorId)
    expect(job?.data.title).toBe('New comment on your answer')
    expect(job?.data.content).toBe('Short comment')
  })

  it('should truncate long comment content to 100 characters', async () => {
    const answerAuthorId = 'answer-author-id'
    const commentAuthorId = 'comment-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId: answerAuthorId })
    )
    const longContent = 'a'.repeat(150)
    const comment: Comment = {
      id: 'comment-1',
      ...makeCommentData({ answerId: answer.id, authorId: commentAuthorId, content: longContent }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new CommentCreatedEvent(comment)

    await sut.handle(event)

    const job = notificationQueue.findJob('new-comment')
    expect(job?.data.content).toBe('a'.repeat(100) + '...')
  })
})
