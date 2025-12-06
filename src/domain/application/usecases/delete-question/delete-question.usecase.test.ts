import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { DeleteQuestionUseCase } from './delete-question.usecase'
import { makeQuestionData } from '@tests/factories/domain/make-question'

describe('DeleteQuestionUseCase', () => {
  let sut: DeleteQuestionUseCase
  let questionsRepository: QuestionsRepository
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new DeleteQuestionUseCase(questionsRepository)
  })
  it('should not delete a nonexistent question', async () => {
    await expect(
      sut.execute({
        questionId: 'any_inexistent_id',
        authorId: 'any_author_id',
      })
    ).rejects.toThrowError(new ResourceNotFoundException('Question'))
  })
  it('should not delete a question if the user is not the author', async () => {
    const question = await questionsRepository.create(makeQuestionData())
    await expect(
      sut.execute({
        questionId: question.id,
        authorId: 'wrong_author_id',
      })
    ).rejects.toThrowError(new NotAuthorException('question'))
  })
  it('should delete a question', async () => {
    const question = await questionsRepository.create(makeQuestionData())
    await sut.execute({ questionId: question.id, authorId: question.authorId })
    const deletedQuestion = await questionsRepository.findById(question.id)
    expect(deletedQuestion).toBeNull()
  })
})
