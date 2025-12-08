import { InMemoryQuestionCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-comments.repository'
import { UpdateQuestionCommentUseCase } from './update-question-comment.usecase'
import { makeQuestionCommentData } from '@tests/factories/domain/make-question-comment'

describe('UpdateQuestionCommentUseCase', () => {
  let sut: UpdateQuestionCommentUseCase
  let questionCommentsRepository: InMemoryQuestionCommentsRepository

  beforeEach(() => {
    questionCommentsRepository = new InMemoryQuestionCommentsRepository()
    sut = new UpdateQuestionCommentUseCase(questionCommentsRepository)
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
    const comment = await questionCommentsRepository.create(makeQuestionCommentData({ authorId: 'comment-author-id' }))

    const request = {
      commentId: comment.id,
      authorId: 'unauthorized-user-id',
      content: 'Updated content',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author of the comment')
  })

  it('should update a question comment', async () => {
    const comment = await questionCommentsRepository.create(makeQuestionCommentData({
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
