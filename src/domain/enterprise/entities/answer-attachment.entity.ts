import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'

export type AnswerAttachmentProps = Omit<Props<AnswerAttachment>, 'type'>

export class AnswerAttachment extends Attachment {
  declare readonly answerId: string
  declare readonly type: 'answer'

  private constructor (props: AnswerAttachmentProps) {
    super({ ...props, type: 'answer' })
  }

  static create (props: AnswerAttachmentProps): AnswerAttachment {
    return new AnswerAttachment(props)
  }
}
