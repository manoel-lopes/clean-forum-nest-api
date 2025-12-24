import { Props } from '@/shared/types/custom/props'
import { Attachment, ChildEntity } from './base/attachment.entity'

export type QuestionAttachmentProps = Omit<Props<QuestionAttachment>, 'type'>

@ChildEntity('question')
export class QuestionAttachment extends Attachment {
  declare readonly questionId: string

  private constructor (props: QuestionAttachmentProps) {
    super(props)
  }

  static create (props: QuestionAttachmentProps): QuestionAttachment {
    return new QuestionAttachment(props)
  }
}
