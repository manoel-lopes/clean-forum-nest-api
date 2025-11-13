import { InMemoryQuestionCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-comments.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { makeQuestionData } from '@/shared/util/factories/domain/make-question'
import { makeQuestionCommentData } from '@/shared/util/factories/domain/make-question-comment'
import { DeleteQuestionCommentUseCase } from './delete-question-comment.usecase'

describe('DeleteQuestionCommentUseCase', () => {
  let sut: DeleteQuestionCommentUseCase
  let questionCommentsRepository: InMemoryQuestionCommentsRepository
  let questionsRepository: InMemoryQuestionsRepository

  beforeEach(() => {
    questionCommentsRepository = new InMemoryQuestionCommentsRepository()
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new DeleteQuestionCommentUseCase(questionCommentsRepository, questionsRepository)
  })

  it('should not delete a nonexistent comment', async () => {
    const request = {
      commentId: 'nonexistent-comment-id',
      authorId: 'any-author-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Comment not found')
  })

  it('should not delete a comment if the question does not exist', async () => {
    const question = await questionsRepository.create(makeQuestionData({ authorId: 'question-author-id' }))
    const comment = await questionCommentsRepository.create(makeQuestionCommentData({
      questionId: question.id,
      authorId: 'comment-author-id',
    }))
    await questionsRepository.delete(question.id)
    const request = {
      commentId: comment.id,
      authorId: 'comment-author-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Question not found')
  })

  it('should not delete a comment if the user is not the comment author or question author', async () => {
    const question = await questionsRepository.create(makeQuestionData({ authorId: 'question-author-id' }))

    const comment = await questionCommentsRepository.create(makeQuestionCommentData({
      questionId: question.id,
      authorId: 'comment-author-id',
    }))

    const request = {
      commentId: comment.id,
      authorId: 'unauthorized-user-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author of the comment')
  })

  it('should delete a comment when user is the comment author', async () => {
    const question = await questionsRepository.create(makeQuestionData({ authorId: 'question-author-id' }))

    const comment = await questionCommentsRepository.create(makeQuestionCommentData({
      questionId: question.id,
      authorId: 'comment-author-id',
    }))

    const request = {
      commentId: comment.id,
      authorId: comment.authorId,
    }

    await sut.execute(request)

    const deletedComment = await questionCommentsRepository.findById(comment.id)
    expect(deletedComment).toBeNull()
  })

  it('should delete a comment when user is the question author', async () => {
    const question = await questionsRepository.create(makeQuestionData({ authorId: 'question-author-id' }))

    const comment = await questionCommentsRepository.create(makeQuestionCommentData({
      questionId: question.id,
      authorId: 'comment-author-id',
    }))

    const request = {
      commentId: comment.id,
      authorId: question.authorId,
    }

    await sut.execute(request)

    const deletedComment = await questionCommentsRepository.findById(comment.id)
    expect(deletedComment).toBeNull()
  })
})
