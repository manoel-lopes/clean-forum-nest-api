import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { InMemoryQuestionAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-attachments.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { makeQuestionAttachmentData } from '@/shared/util/factories/domain/make-question-attachment'
import { UpdateQuestionAttachmentUseCase } from './update-question-attachment.usecase'

describe('UpdateQuestionAttachmentUseCase', () => {
  let sut: UpdateQuestionAttachmentUseCase
  let questionAttachmentsRepository: QuestionAttachmentsRepository

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    sut = new UpdateQuestionAttachmentUseCase(questionAttachmentsRepository)
  })

  it('should throw error when attachment does not exist', async () => {
    const request = {
      attachmentId: 'non-existent-id',
      title: 'Updated Title',
    }

    await expect(sut.execute(request)).rejects.toThrow(new ResourceNotFoundError('Attachment'))
  })

  it('should update attachment title', async () => {
    const attachment = await questionAttachmentsRepository.create(makeQuestionAttachmentData({
      title: 'Original Title',
      url: 'https://example.com/original.pdf',
    }))

    const response = await sut.execute({
      attachmentId: attachment.id,
      title: 'Updated Title',
    })

    expect(response.id).toBe(attachment.id)
    expect(response.title).toBe('Updated Title')
    expect(response.url).toBe('https://example.com/original.pdf')
  })

  it('should update attachment link', async () => {
    const attachment = await questionAttachmentsRepository.create(makeQuestionAttachmentData({
      title: 'Document Title',
      url: 'https://example.com/original.pdf',
    }))

    const response = await sut.execute({
      attachmentId: attachment.id,
      url: 'https://example.com/updated.pdf',
    })

    expect(response.id).toBe(attachment.id)
    expect(response.title).toBe('Document Title')
    expect(response.url).toBe('https://example.com/updated.pdf')
  })

  it('should update both title and link', async () => {
    const attachment = await questionAttachmentsRepository.create(makeQuestionAttachmentData())

    const response = await sut.execute({
      attachmentId: attachment.id,
      title: 'New Title',
      url: 'https://example.com/new.pdf',
    })

    expect(response.id).toBe(attachment.id)
    expect(response.title).toBe('New Title')
    expect(response.url).toBe('https://example.com/new.pdf')
  })
})
