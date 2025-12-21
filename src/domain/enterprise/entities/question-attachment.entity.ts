import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'

export type QuestionAttachmentProps = Props<QuestionAttachment>

@ChildEntity('question')
export class QuestionAttachment extends Attachment {
  private constructor (props: QuestionAttachmentProps) {
    super(props)
  }

  static create (props: QuestionAttachmentProps): QuestionAttachment {
    return new QuestionAttachment(props)
  }
}
