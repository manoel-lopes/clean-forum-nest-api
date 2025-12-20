import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'

export type QuestionAttachmentProps = Props<QuestionAttachment>

@ChildEntity('question')
export class QuestionAttachment extends Attachment {
  private constructor (props: QuestionAttachmentProps, id?: string) {
    super(props, id)
  }

  static create (props: QuestionAttachmentProps, id?: string): QuestionAttachment {
    return new QuestionAttachment(props, id)
  }
}
