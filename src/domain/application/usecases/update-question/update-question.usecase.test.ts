import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { UpdateQuestionUseCase } from './update-question.usecase'
import { makeQuestionData } from '@tests/factories/domain/make-question'

describe('UpdateQuestionUseCase', () => {
  let sut: UpdateQuestionUseCase
  let questionsRepository: QuestionsRepository

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new UpdateQuestionUseCase(questionsRepository)
  })

  it('should not update a nonexistent question', async () => {
    await expect(
      sut.execute({
        questionId: 'any_inexistent_id',
        authorId: 'any-author-id',
      })
    ).rejects.toThrowError(new ResourceNotFoundError('Question'))
  })

  it('should not update a question if the user is not the author', async () => {
    const questionData = makeQuestionData({ authorId: 'original-author' })
    const question = await questionsRepository.create(questionData)

    const request = {
      questionId: question.id,
      authorId: 'different-author',
      title: 'new_title',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author')
  })

  it('should update the question title', async () => {
    const question = await questionsRepository.create(makeQuestionData())

    const response = await sut.execute({
      questionId: question.id,
      authorId: question.authorId,
      title: 'new_title',
    })

    expect(response.id).toBe(question.id)
    expect(response.title).toBe('new_title')
  })

  it('should update the question content', async () => {
    const question = await questionsRepository.create(makeQuestionData())

    const response = await sut.execute({
      questionId: question.id,
      authorId: question.authorId,
      content: 'new_content',
    })

    expect(response.id).toBe(question.id)
    expect(response.content).toBe('new_content')
  })

  it('should update both title and content', async () => {
    const question = await questionsRepository.create(makeQuestionData())

    const response = await sut.execute({
      questionId: question.id,
      authorId: question.authorId,
      title: 'new_title',
      content: 'new_content',
    })

    expect(response.id).toBe(question.id)
    expect(response.title).toBe('new_title')
    expect(response.content).toBe('new_content')
  })
})
