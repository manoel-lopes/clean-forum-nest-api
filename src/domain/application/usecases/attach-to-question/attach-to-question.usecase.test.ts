import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-attachments.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { AttachToQuestionUseCase } from './attach-to-question.usecase'
import { makeQuestion } from '@tests/factories/domain/make-question'

describe('AttachToQuestionUseCase', () => {
  let sut: AttachToQuestionUseCase
  let questionsRepository: QuestionsRepository
  let questionAttachmentsRepository: QuestionAttachmentsRepository

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    sut = new AttachToQuestionUseCase(questionsRepository, questionAttachmentsRepository)
  })

  it('should throw error when question does not exist', async () => {
    const request = {
      questionId: 'non-existent-id',
      title: 'Test Document',
      url: 'https://example.com/test.pdf',
    }

    await expect(sut.execute(request)).rejects.toThrow(new ResourceNotFoundException('Question'))
  })

  it('should attach a file to a question', async () => {
    const question = makeQuestion()
    await questionsRepository.save(question)

    const request = {
      questionId: question.id,
      title: 'Test Document',
      url: 'https://example.com/test.pdf',
    }

    await sut.execute(request)

    const attachments = await questionAttachmentsRepository.findManyByQuestionId(question.id, { page: 1, pageSize: 10 })
    expect(attachments.items).toHaveLength(1)
    expect(attachments.items[0].questionId).toBe(question.id)
    expect(attachments.items[0].title).toBe('Test Document')
    expect(attachments.items[0].url).toBe('https://example.com/test.pdf')
  })
})
