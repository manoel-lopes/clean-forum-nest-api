import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'

export type AnswerAttachmentProps = Props<AnswerAttachment>

@ChildEntity('answer')
export class AnswerAttachment extends Attachment {
  private constructor (props: AnswerAttachmentProps, id?: string) {
    super(props, id)
  }

  static create (props: AnswerAttachmentProps, id?: string): AnswerAttachment {
    return new AnswerAttachment(props, id)
  }
}
