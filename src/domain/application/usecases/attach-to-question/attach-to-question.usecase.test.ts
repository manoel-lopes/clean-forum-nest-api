import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-attachments.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { makeQuestionData } from '@/shared/util/factories/domain/make-question'
import { AttachToQuestionUseCase } from './attach-to-question.usecase'

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

    await expect(sut.execute(request)).rejects.toThrow(new ResourceNotFoundError('Question'))
  })

  it('should attach a file to a question', async () => {
    const question = await questionsRepository.create(makeQuestionData())

    const request = {
      questionId: question.id,
      title: 'Test Document',
      url: 'https://example.com/test.pdf',
    }

    const response = await sut.execute(request)

    expect(response.questionId).toBe(question.id)
    expect(response.title).toBe('Test Document')
    expect(response.url).toBe('https://example.com/test.pdf')
  })
})
