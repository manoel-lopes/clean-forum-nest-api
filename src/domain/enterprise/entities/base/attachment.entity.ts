import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  TableInheritance,
} from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Answer } from '../answer.entity'
import { Question } from '../question.entity'
import { BaseEntity } from './base.entity'

export type AttachmentProps = Props<Attachment>

@Entity('attachments')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Attachment extends BaseEntity {
  @Column({ type: 'text' })
  readonly title: string

  @Column({ type: 'text' })
  readonly url: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  readonly questionId?: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  readonly answerId?: string

  @ManyToOne(() => Question, question => question.attachments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'questionId' })
  readonly question: Question

  @ManyToOne(() => Answer, answer => answer.attachments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'answerId' })
  readonly answer: Answer

  protected constructor (props: AttachmentProps, id?: string) {
    super(id)
    Object.assign(this, props)
  }
}
