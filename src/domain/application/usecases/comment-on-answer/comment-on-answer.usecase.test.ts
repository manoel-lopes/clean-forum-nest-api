import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-comments.repository'
import { CommentOnAnswerUseCase } from './comment-on-answer.usecase'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { MockDomainEventEmitter } from '@tests/mocks/domain-event-emitter.mock'

describe('CommentOnAnswerUseCase', () => {
  let sut: CommentOnAnswerUseCase
  let answersRepository: AnswersRepository
  let commentsRepository: CommentsRepository
  let eventEmitter: MockDomainEventEmitter

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    commentsRepository = new InMemoryCommentsRepository()
    eventEmitter = new MockDomainEventEmitter()
    sut = new CommentOnAnswerUseCase(answersRepository, commentsRepository, eventEmitter)
  })

  it('should not comment on a inexistent answer', async () => {
    const request = {
      answerId: 'nonexistent-answer-id',
      content: 'Test comment content',
      authorId: 'author-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Answer not found')
  })

  it('should comment on a answer', async () => {
    const answer = await answersRepository.create(makeAnswerData())

    const request = {
      answerId: answer.id,
      content: 'Test comment content',
      authorId: 'author-id',
    }

    await sut.execute(request)

    const comments = await commentsRepository.findManyByAnswerId(answer.id, {
      page: 1,
      pageSize: 10,
    })

    expect(comments.items).toHaveLength(1)
    expect(comments.items[0].content).toBe('Test comment content')
    expect(comments.items[0].authorId).toBe('author-id')
    expect(comments.items[0].answerId).toBe(answer.id)
  })
})
