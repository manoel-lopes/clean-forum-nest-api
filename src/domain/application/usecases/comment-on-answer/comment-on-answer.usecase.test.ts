import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-comments.repository'
import { CommentOnAnswerUseCase } from './comment-on-answer.usecase'
import { makeAnswer } from '@tests/factories/domain/make-answer'

describe('CommentOnAnswerUseCase', () => {
  let sut: CommentOnAnswerUseCase
  let answersRepository: AnswersRepository
  let commentsRepository: CommentsRepository

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    commentsRepository = new InMemoryCommentsRepository()
    sut = new CommentOnAnswerUseCase(answersRepository, commentsRepository)
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
    const answer = makeAnswer()
    await answersRepository.save(answer)

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
