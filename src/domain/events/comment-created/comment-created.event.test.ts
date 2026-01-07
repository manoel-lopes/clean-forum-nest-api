import type { Comment } from '@/domain/enterprise/entities/comment.entity'
import { CommentCreatedEvent } from './comment-created.event'
import { makeCommentData } from '@tests/factories/domain/make-comment'

describe('CommentCreatedEvent', () => {
  it('should have correct event name', () => {
    const comment: Comment = {
      id: 'comment-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeCommentData(),
    }

    const event = new CommentCreatedEvent(comment)

    expect(event.eventName).toBe('comment.created')
  })

  it('should set occurredAt to current date', () => {
    const comment: Comment = {
      id: 'comment-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeCommentData(),
    }
    const before = new Date()

    const event = new CommentCreatedEvent(comment)

    const after = new Date()
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should store the comment', () => {
    const comment: Comment = {
      id: 'comment-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeCommentData(),
    }

    const event = new CommentCreatedEvent(comment)

    expect(event.comment).toBe(comment)
  })
})
