import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'

export type QuestionAttachmentProps = Omit<Props<QuestionAttachment>, 'type'>

export class QuestionAttachment extends Attachment {
  declare readonly questionId: string
  declare readonly type: 'question'

  private constructor (props: QuestionAttachmentProps) {
    super({ ...props, type: 'question' })
  }

  static create (props: QuestionAttachmentProps): QuestionAttachment {
    return new QuestionAttachment(props)
  }
}
