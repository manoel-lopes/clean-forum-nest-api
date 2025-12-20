import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { GetQuestionBySlugUseCase } from './get-question-by-slug.usecase'
import { makeQuestion } from '@tests/factories/domain/make-question'

describe('GetQuestionBySlugUseCase', () => {
  let sut: GetQuestionBySlugUseCase
  let questionRepository: QuestionsRepository
  const request = {
    slug: 'any-slug',
  }

  beforeEach(() => {
    questionRepository = new InMemoryQuestionsRepository()
    sut = new GetQuestionBySlugUseCase(questionRepository)
  })

  it('should not get a nonexistent question', async () => {
    await expect(
      sut.execute({
        slug: 'any-inexistent-slug',
      })
    ).rejects.toThrowError(new ResourceNotFoundException('Question'))
  })

  it('should get a question using the slug', async () => {
    const question = makeQuestion({ slug: request.slug })
    await questionRepository.save(question)

    const response = await sut.execute(request)

    expect(response.id).toBe(question.id)
    expect(response.content).toBe(question.content)
    expect(response.title).toBe(question.title)
    expect(response.authorId).toBe(question.authorId)
    expect(response.bestAnswerId).toBe(question.bestAnswerId)
    expect(response.createdAt).toBeInstanceOf(Date)
    expect(response.updatedAt).toBeInstanceOf(Date)
    expect(response.slug).toBe('any-slug')
  })
})
