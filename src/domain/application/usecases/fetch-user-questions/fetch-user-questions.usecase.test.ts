import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { FetchUserQuestionsUseCase } from './fetch-user-questions.usecase'

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
    await questionsRepository.create({ authorId: userId, title: 'Q1', content: 'Content 1', slug: 'q1' })
    await questionsRepository.create({ authorId: userId, title: 'Q2', content: 'Content 2', slug: 'q2' })
    await questionsRepository.create({ authorId: otherUserId, title: 'Q3', content: 'Content 3', slug: 'q3' })

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
      await questionsRepository.create({ authorId: userId, title: `Q${i}`, content: `Content ${i}`, slug: `q${i}` })
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
