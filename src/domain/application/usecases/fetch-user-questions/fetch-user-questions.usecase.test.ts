import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { FetchUserQuestionsUseCase } from './fetch-user-questions.usecase'
import { makeQuestion } from '@tests/factories/domain/make-question'

describe('FetchUserQuestionsUseCase', () => {
  let questionsRepository: InMemoryQuestionsRepository
  let sut: FetchUserQuestionsUseCase

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new FetchUserQuestionsUseCase(questionsRepository)
  })

  it('should fetch questions from a specific user', async () => {
    const userId = 'user-123'
    const otherUserId = 'user-456'
    const q1 = makeQuestion({ authorId: userId, title: 'Q1', slug: 'q1' })
    const q2 = makeQuestion({ authorId: userId, title: 'Q2', slug: 'q2' })
    const q3 = makeQuestion({ authorId: otherUserId, title: 'Q3', slug: 'q3' })
    await questionsRepository.save(q1)
    await questionsRepository.save(q2)
    await questionsRepository.save(q3)

    const response = await sut.execute({
      userId,
      page: 1,
      pageSize: 10,
      order: 'desc',
    })

    expect(response.items).toHaveLength(2)
    expect(response.items.every((q) => q.authorId === userId)).toBe(true)
    expect(response.totalItems).toBe(2)
  })

  it('should return empty list if user has no questions', async () => {
    const response = await sut.execute({
      userId: 'non-existent-user',
      page: 1,
      pageSize: 10,
      order: 'desc',
    })

    expect(response.items).toHaveLength(0)
    expect(response.totalItems).toBe(0)
  })

  it('should paginate user questions correctly', async () => {
    const userId = 'user-123'
    for (let i = 0; i < 15; i++) {
      const question = makeQuestion({ authorId: userId, title: `Q${i}`, slug: `q${i}` })
      await questionsRepository.save(question)
    }

    const page1 = await sut.execute({
      userId,
      page: 1,
      pageSize: 10,
      order: 'desc',
    })

    const page2 = await sut.execute({
      userId,
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
