import { makeAnswerData } from 'tests/factories/domain/make-answer'
import type { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswerAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answer-attachments.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { AttachToAnswerUseCase } from './attach-to-answer.usecase'

describe('AttachToAnswerUseCase', () => {
  let sut: AttachToAnswerUseCase
  let answersRepository: AnswersRepository
  let answerAttachmentsRepository: AnswerAttachmentsRepository

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
    sut = new AttachToAnswerUseCase(answersRepository, answerAttachmentsRepository)
  })

  it('should throw error when answer does not exist', async () => {
    await expect(sut.execute({
      answerId: 'non-existent-id',
      title: 'Test Document',
      url: 'https://example.com/test.pdf',
    })).rejects.toThrow(new ResourceNotFoundError('Answer'))
  })

  it('should attach a file to an answer', async () => {
    const answer = await answersRepository.create(makeAnswerData())

    const response = await sut.execute({
      answerId: answer.id,
      title: 'Test Document',
      url: 'https://example.com/document.pdf',
    })

    expect(response.answerId).toEqual(answer.id)
    expect(response.title).toEqual('Test Document')
    expect(response.url).toEqual('https://example.com/document.pdf')
  })
})
