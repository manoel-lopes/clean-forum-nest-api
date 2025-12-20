import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { UpdateAnswerUseCase } from './update-answer.usecase'
import { makeAnswer } from '@tests/factories/domain/make-answer'

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
      authorId: 'any-author-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Answer not found')
  })

  it('should not update an answer if the user is not the author', async () => {
    const answer = makeAnswer({ authorId: 'original-author' })
    await answersRepository.save(answer)

    const request = {
      answerId: answer.id,
      authorId: 'different-author',
      content: 'Updated content',
    }

    await expect(sut.execute(request)).rejects.toThrow('The user is not the author')
  })

  it('should update the answer content', async () => {
    const answer = makeAnswer({ content: 'Original content' })
    await answersRepository.save(answer)

    const request = {
      answerId: answer.id,
      authorId: answer.authorId,
      content: 'Updated content',
    }

    const response = await sut.execute(request)

    expect(response.id).toBe(answer.id)
    expect(response.content).toBe('Updated content')
  })
})
