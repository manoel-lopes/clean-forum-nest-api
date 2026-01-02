import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers.usecase'
import { makeAnswer } from '@tests/factories/domain/make-answer'
import { makeQuestion } from '@tests/factories/domain/make-question'

describe('FetchQuestionAnswersUseCase', () => {
  let answersRepository: InMemoryAnswersRepository
  let questionsRepository: InMemoryQuestionsRepository
  let sut: FetchQuestionAnswersUseCase

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new FetchQuestionAnswersUseCase(answersRepository, questionsRepository)
  })

  it('should fetch answers for a specific question', async () => {
    const question = makeQuestion()
    await questionsRepository.save(question)

    const answer1 = makeAnswer({ questionId: question.id, authorId: 'author-1' })
    const answer2 = makeAnswer({ questionId: question.id, authorId: 'author-2' })
    const answer3 = makeAnswer({ questionId: 'other-question', authorId: 'author-3' })
    await answersRepository.save(answer1)
    await answersRepository.save(answer2)
    await answersRepository.save(answer3)

    const response = await sut.execute({
      questionId: question.id,
      page: 1,
      pageSize: 10,
      order: 'desc',
    })

    expect(response.items).toHaveLength(2)
    expect(response.items.every((a) => a.questionId === question.id)).toBe(true)
    expect(response.totalItems).toBe(2)
  })

  it('should throw ResourceNotFoundError if question does not exist', async () => {
    await expect(
      sut.execute({
        questionId: 'non-existent-question',
        page: 1,
        pageSize: 10,
        order: 'desc',
      })
    ).rejects.toThrow('Question not found')
  })

  it('should return empty list if question has no answers', async () => {
    const question = makeQuestion()
    await questionsRepository.save(question)

    const response = await sut.execute({
      questionId: question.id,
      page: 1,
      pageSize: 10,
      order: 'desc',
    })

    expect(response.items).toHaveLength(0)
    expect(response.totalItems).toBe(0)
  })

  it('should paginate question answers correctly', async () => {
    const question = makeQuestion()
    await questionsRepository.save(question)

    for (let i = 0; i < 15; i++) {
      const answer = makeAnswer({ questionId: question.id, authorId: 'author-1' })
      await answersRepository.save(answer)
    }

    const page1 = await sut.execute({
      questionId: question.id,
      page: 1,
      pageSize: 10,
      order: 'desc',
    })

    const page2 = await sut.execute({
      questionId: question.id,
      page: 2,
      pageSize: 10,
      order: 'desc',
    })

    expect(page1.items).toHaveLength(10)
    expect(page2.items).toHaveLength(5)
    expect(page1.totalItems).toBe(15)
    expect(page2.totalItems).toBe(15)
    expect(page1.totalPages).toBe(2)
  })
})
