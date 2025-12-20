import { InMemoryAnswerCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answer-comments.repository'
import { UpdateAnswerCommentUseCase } from './update-answer-comment.usecase'
import { makeAnswerComment } from '@tests/factories/domain/make-answer-comment'

describe('UpdateAnswerCommentUseCase', () => {
  let sut: UpdateAnswerCommentUseCase
  let answerCommentsRepository: InMemoryAnswerCommentsRepository

  beforeEach(() => {
    answerCommentsRepository = new InMemoryAnswerCommentsRepository()
    sut = new UpdateAnswerCommentUseCase(answerCommentsRepository)
  })

  it('should not update a nonexistent comment', async () => {
    const request = {
      commentId: 'nonexistent-comment-id',
      authorId: 'author-id',
      content: 'Updated content',
    }

    await expect(sut.execute(request)).rejects.toThrow('Comment not found')
  })

  it('should not update a comment if the user is not the author', async () => {
    const comment = makeAnswerComment({ authorId: 'comment-author-id' })
    await answerCommentsRepository.save(comment)

    const request = {
      commentId: comment.id,
      authorId: 'unauthorized-user-id',
      content: 'Updated content',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author of the comment')
  })

  it('should update an answer comment', async () => {
    const comment = makeAnswerComment({
      authorId: 'comment-author-id',
      content: 'Original content',
    })
    await answerCommentsRepository.save(comment)

    const request = {
      commentId: comment.id,
      authorId: comment.authorId,
      content: 'Updated content',
    }

    const response = await sut.execute(request)

    expect(response.id).toBe(comment.id)
    expect(response.content).toBe('Updated content')
  })
})
