import { Props } from '@/shared/types/custom/props'
import { Attachment, ChildEntity } from './base/attachment.entity'

export type AnswerAttachmentProps = Omit<Props<AnswerAttachment>, 'type'>

@ChildEntity('answer')
export class AnswerAttachment extends Attachment {
  declare readonly answerId: string

  private constructor (props: AnswerAttachmentProps) {
    super(props)
  }

  static create (props: AnswerAttachmentProps): AnswerAttachment {
    return new AnswerAttachment(props)
  }
}
