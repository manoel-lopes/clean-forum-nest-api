import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { makeAnswerData } from '@/shared/util/factories/domain/make-answer'
import { UpdateAccountUseCase } from './update-answer.usecase'

describe('UpdateAccountUseCase', () => {
  let sut: UpdateAccountUseCase
  let answersRepository: AnswersRepository

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    sut = new UpdateAccountUseCase(answersRepository)
  })

  it('should not update a nonexistent answer', async () => {
    const request = {
      answerId: 'nonexistent-answer-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Answer not found')
  })

  it('should update the answer content', async () => {
    const answer = await answersRepository.create(makeAnswerData({ content: 'Original content' }))

    const request = {
      answerId: answer.id,
      content: 'Updated content',
    }

    const response = await sut.execute(request)

    expect(response.id).toBe(answer.id)
    expect(response.content).toBe('Updated content')
  })
})
