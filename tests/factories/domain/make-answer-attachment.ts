import { uuidv7 } from 'uuidv7'
import { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'

export function makeAnswerAttachment (overrides: Partial<AnswerAttachmentProps> = {}): AnswerAttachment {
  const props: AnswerAttachmentProps = {
    title: 'any-title',
    url: 'https://example.com/file.pdf',
    answerId: uuidv7(),
    ...overrides,
  }
  return AnswerAttachment.create(props)
}
