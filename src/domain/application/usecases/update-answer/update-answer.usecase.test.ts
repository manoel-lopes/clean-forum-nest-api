import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { UpdateAnswerUseCase } from './update-answer.usecase'
import { makeAnswerData } from '@tests/factories/domain/make-answer'

describe('UpdateAnswerUseCase', () => {
  let sut: UpdateAnswerUseCase
  let answersRepository: AnswersRepository

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    sut = new UpdateAnswerUseCase(answersRepository)
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
