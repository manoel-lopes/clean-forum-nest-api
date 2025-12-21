import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'

export type AnswerAttachmentProps = Props<AnswerAttachment>

@ChildEntity('answer')
export class AnswerAttachment extends Attachment {
  private constructor (props: AnswerAttachmentProps) {
    super(props)
  }

  static create (props: AnswerAttachmentProps): AnswerAttachment {
    return new AnswerAttachment(props)
  }
}
