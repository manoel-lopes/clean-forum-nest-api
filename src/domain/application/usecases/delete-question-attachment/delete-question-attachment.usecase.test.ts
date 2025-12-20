import type { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { InMemoryQuestionAttachmentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-attachments.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { DeleteQuestionAttachmentUseCase } from './delete-question-attachment.usecase'
import { makeQuestionAttachment } from '@tests/factories/domain/make-question-attachment'

describe('DeleteQuestionAttachmentUseCase', () => {
  let sut: DeleteQuestionAttachmentUseCase
  let questionAttachmentsRepository: QuestionAttachmentsRepository

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    sut = new DeleteQuestionAttachmentUseCase(questionAttachmentsRepository)
  })

  it('should throw error when attachment does not exist', async () => {
    const request = { attachmentId: 'non-existent-id' }

    await expect(sut.execute(request)).rejects.toThrow(new ResourceNotFoundException('Attachment'))
  })

  it('should delete an attachment', async () => {
    const attachment = makeQuestionAttachment()
    await questionAttachmentsRepository.save(attachment)

    await sut.execute({ attachmentId: attachment.id })

    const deletedAttachment = await questionAttachmentsRepository.findById(attachment.id)
    expect(deletedAttachment).toBeNull()
  })
})
