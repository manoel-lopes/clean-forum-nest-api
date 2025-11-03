import type { Props } from '@/shared/types/custom/props'
import type { Attachment } from './base/attachment.entity'

export type AnswerAttachmentProps = Props<AnswerAttachment>

export interface AnswerAttachment extends Attachment {
  answerId: string
}
