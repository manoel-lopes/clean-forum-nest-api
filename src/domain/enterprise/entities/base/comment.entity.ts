import { Column, Entity, JoinColumn, ManyToOne, TableInheritance } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Answer } from '../answer.entity'
import { Question } from '../question.entity'
import { User } from '../user.entity'
import { BaseEntity } from './base.entity'

export type CommentProps = Props<Comment>

@Entity('comments')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Comment extends BaseEntity {
  @Column({ type: 'text' })
  readonly content: string

  @Column({ type: 'varchar', length: 36 })
  readonly authorId: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  readonly questionId?: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  readonly answerId?: string

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  readonly author: User

  @ManyToOne(() => Question, question => question.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'questionId' })
  readonly question?: Question

  @ManyToOne(() => Answer, answer => answer.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'answerId' })
  readonly answer?: Answer

  protected constructor (props: CommentProps, id?: string) {
    super(id)
    Object.assign(this, props)
  }
}
