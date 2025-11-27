import { makeAnswerAttachmentData } from 'tests/factories/domain/make-answer-attachment'
import type { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { InMemoryAnswerAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answer-attachments.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { DeleteAnswerAttachmentUseCase } from './delete-answer-attachment.usecase'

describe('DeleteAnswerAttachmentUseCase', () => {
  let sut: DeleteAnswerAttachmentUseCase
  let answerAttachmentsRepository: AnswerAttachmentsRepository

  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
    sut = new DeleteAnswerAttachmentUseCase(answerAttachmentsRepository)
  })

  it('should throw error when attachment does not exist', async () => {
    const request = { attachmentId: 'non-existent-id' }

    await expect(sut.execute(request)).rejects.toThrow(new ResourceNotFoundError('Attachment'))
  })

  it('should delete an attachment', async () => {
    const attachment = await answerAttachmentsRepository.create(makeAnswerAttachmentData())

    await sut.execute({ attachmentId: attachment.id })

    const deletedAttachment = await answerAttachmentsRepository.findById(attachment.id)
    expect(deletedAttachment).toBeNull()
  })
})
