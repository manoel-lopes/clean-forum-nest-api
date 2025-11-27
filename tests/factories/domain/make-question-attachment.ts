import { uuidv7 } from 'uuidv7'
import type {
  QuestionAttachmentProps,
} from '@/domain/enterprise/entities/question-attachment.entity'

export function makeQuestionAttachmentData (overrides: Partial<QuestionAttachmentProps> = {}): QuestionAttachmentProps {
  const attachment: QuestionAttachmentProps = {
    title: 'any-title',
    url: 'https://example.com/file.pdf',
    questionId: uuidv7()
  }
  return Object.assign(attachment, overrides)
}
