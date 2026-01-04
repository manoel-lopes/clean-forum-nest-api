import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { BaseAttachment } from '../base/attachment.entity'
import type { Question } from '../question/question.entity'

export type QuestionAttachmentProps = Props<QuestionAttachment>

@ChildEntity('question')
export class QuestionAttachment extends BaseAttachment {
  @Column({ type: 'varchar', length: 36, name: 'questionId' })
  questionId: string

  @ManyToOne('Question', 'attachments')
  @JoinColumn({ name: 'questionId' })
  question: Question

  private constructor (props: QuestionAttachmentProps) {
    super(props)
    Object.assign(this, props)
  }

  static create (props: QuestionAttachmentProps): QuestionAttachment {
    return new QuestionAttachment(props)
  }
}
