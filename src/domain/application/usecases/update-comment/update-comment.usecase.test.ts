import { InMemoryCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-comments.repository'
import { makeCommentData } from '@/shared/util/factories/domain/make-comment'
import { UpdateCommentUseCase } from './update-comment.usecase'

describe('UpdateCommentUseCase', () => {
  let sut: UpdateCommentUseCase
  let commentsRepository: InMemoryCommentsRepository

  beforeEach(() => {
    commentsRepository = new InMemoryCommentsRepository()
    sut = new UpdateCommentUseCase(commentsRepository)
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
    const comment = await commentsRepository.create(makeCommentData({ authorId: 'comment-author-id' }))

    const request = {
      commentId: comment.id,
      authorId: 'unauthorized-user-id',
      content: 'Updated content',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author of the comment')
  })

  it('should update a comment', async () => {
    const comment = await commentsRepository.create(makeCommentData({
      authorId: 'comment-author-id',
      content: 'Original content',
    }))

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
