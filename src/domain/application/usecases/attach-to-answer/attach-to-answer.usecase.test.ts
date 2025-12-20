import type { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswerAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answer-attachments.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { AttachToAnswerUseCase } from './attach-to-answer.usecase'
import { makeAnswer } from '@tests/factories/domain/make-answer'

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
    })).rejects.toThrow(new ResourceNotFoundException('Answer'))
  })

  it('should attach a file to an answer', async () => {
    const answer = makeAnswer()
    await answersRepository.save(answer)

    await sut.execute({
      answerId: answer.id,
      title: 'Test Document',
      url: 'https://example.com/document.pdf',
    })

    const attachments = await answerAttachmentsRepository.findManyByAnswerId(answer.id, { page: 1, pageSize: 10 })
    expect(attachments.items).toHaveLength(1)
    expect(attachments.items[0].answerId).toEqual(answer.id)
    expect(attachments.items[0].title).toEqual('Test Document')
    expect(attachments.items[0].url).toEqual('https://example.com/document.pdf')
  })
})
