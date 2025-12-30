import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-comments.repository'
import { DeleteCommentUseCase } from './delete-comment.usecase'
import { makeAnswer } from '@tests/factories/domain/make-answer'
import { makeComment } from '@tests/factories/domain/make-comment'

describe('DeleteCommentUseCase', () => {
  let sut: DeleteCommentUseCase
  let commentsRepository: InMemoryCommentsRepository
  let answersRepository: InMemoryAnswersRepository

  beforeEach(() => {
    commentsRepository = new InMemoryCommentsRepository()
    answersRepository = new InMemoryAnswersRepository()
    sut = new DeleteCommentUseCase(commentsRepository, answersRepository)
  })

  it('should not delete a nonexistent comment', async () => {
    const request = {
      commentId: 'any_inexistent_id',
      authorId: 'any_author_id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Comment not found')
  })

  it('should not delete a comment if the answer does not exist', async () => {
    const answer = makeAnswer({ authorId: 'answer-author-id' })
    await answersRepository.save(answer)
    const comment = makeComment({ answerId: answer.id, authorId: 'comment-author-id' })
    await commentsRepository.create(comment)
    await answersRepository.delete(answer.id)

    const request = {
      commentId: comment.id,
      authorId: 'comment-author-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Answer not found')
  })

  it('should not delete a comment if the user is not the comment author or answer author', async () => {
    const answer = makeAnswer({ authorId: 'answer-author-id' })
    await answersRepository.save(answer)
    const comment = makeComment({ answerId: answer.id, authorId: 'comment-author-id' })
    await commentsRepository.create(comment)

    const request = {
      commentId: comment.id,
      authorId: 'wrong_author_id',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author of the comment')
  })

  it('should delete a comment when user is the comment author', async () => {
    const answer = makeAnswer({ authorId: 'answer-author-id' })
    await answersRepository.save(answer)
    const comment = makeComment({ answerId: answer.id, authorId: 'comment-author-id' })
    await commentsRepository.create(comment)

    await sut.execute({
      commentId: comment.id,
      authorId: comment.authorId,
    })

    const deletedComment = await commentsRepository.findById(comment.id)
    expect(deletedComment).toBeNull()
  })

  it('should delete a comment when user is the answer author', async () => {
    const answer = makeAnswer({ authorId: 'answer-author-id' })
    await answersRepository.save(answer)
    const comment = makeComment({ answerId: answer.id, authorId: 'comment-author-id' })
    await commentsRepository.create(comment)

    await sut.execute({
      commentId: comment.id,
      authorId: answer.authorId,
    })

    const deletedComment = await commentsRepository.findById(comment.id)
    expect(deletedComment).toBeNull()
  })
})
