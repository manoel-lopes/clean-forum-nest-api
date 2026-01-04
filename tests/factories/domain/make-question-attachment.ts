import { uuidv7 } from 'uuidv7'
import { QuestionAttachment, QuestionAttachmentProps } from '@/domain/enterprise/entities/question-attachment/question-attachment.entity'

export function makeQuestionAttachment (overrides: Partial<QuestionAttachmentProps> = {}): QuestionAttachment {
  const props: QuestionAttachmentProps = {
    title: 'any-title',
    url: 'https://example.com/file.pdf',
    questionId: uuidv7(),
    ...overrides,
  }
  return QuestionAttachment.create(props)
}
