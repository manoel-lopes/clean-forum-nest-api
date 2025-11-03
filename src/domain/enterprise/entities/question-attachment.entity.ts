import type { Props } from '@/shared/types/custom/props'
import type { Attachment } from './base/attachment.entity'

export type QuestionAttachmentProps = Props<QuestionAttachment>

export interface QuestionAttachment extends Attachment {
  questionId: string
}
