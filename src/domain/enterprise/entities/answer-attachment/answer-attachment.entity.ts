import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import type { Answer } from '../answer/answer.entity'
import { BaseAttachment } from '../base/attachment.entity'

export type AnswerAttachmentProps = Props<AnswerAttachment>

@ChildEntity('answer')
export class AnswerAttachment extends BaseAttachment {
  @Column({ type: 'varchar', length: 36, name: 'answerId' })
  answerId: string

  @ManyToOne('Answer', 'attachments')
  @JoinColumn({ name: 'answerId' })
  answer: Answer

  private constructor (props: AnswerAttachmentProps) {
    super(props)
    Object.assign(this, props)
  }

  static create (props: AnswerAttachmentProps): AnswerAttachment {
    return new AnswerAttachment(props)
  }
}
