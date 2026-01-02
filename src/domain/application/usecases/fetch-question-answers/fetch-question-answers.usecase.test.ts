import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers.usecase'

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
    const question = await questionsRepository.create({
      authorId: 'author-1',
      title: 'Test Question',
      content: 'Content',
      slug: 'test-question',
    })

    await answersRepository.create({ questionId: question.id, authorId: 'author-1', content: 'Answer 1', excerpt: 'Answer 1' })
    await answersRepository.create({ questionId: question.id, authorId: 'author-2', content: 'Answer 2', excerpt: 'Answer 2' })
    await answersRepository.create({ questionId: 'other-question', authorId: 'author-3', content: 'Answer 3', excerpt: 'Answer 3' })

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
    const question = await questionsRepository.create({
      authorId: 'author-1',
      title: 'Test Question',
      content: 'Content',
      slug: 'test-question',
    })

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
    const question = await questionsRepository.create({
      authorId: 'author-1',
      title: 'Test Question',
      content: 'Content',
      slug: 'test-question',
    })

    for (let i = 0; i < 15; i++) {
      await answersRepository.create({
        questionId: question.id,
        authorId: 'author-1',
        content: `Answer ${i}`,
        excerpt: `Answer ${i}`,
      })
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
