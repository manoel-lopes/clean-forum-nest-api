import { uuidv7 } from 'uuidv7'
import type { AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'

export function makeAnswerAttachmentData (overrides: Partial<AnswerAttachmentProps> = {}): AnswerAttachmentProps {
  const attachment: AnswerAttachmentProps = {
    title: 'any-title',
    url: 'https://example.com/file.pdf',
    answerId: uuidv7(),
  }
  return Object.assign(attachment, overrides)
}
