import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Answer } from '../answer/answer.entity'
import { BaseEntity } from '../base/base.entity'
import { User } from '../user/user.entity'

export type CommentProps = Props<Comment>

@Entity('comments')
@Index('comments_answerId_idx', ['answerId'])
@Index('comments_authorId_idx', ['authorId'])
@Index('comments_createdAt_idx', ['createdAt'])
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  readonly content: string

  @Column({ type: 'varchar', length: 36 })
  readonly authorId: string

  @Column({ type: 'varchar', length: 36 })
  readonly answerId: string

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  readonly author: User

  @ManyToOne(() => Answer, answer => answer.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answerId' })
  readonly answer: Answer

  private constructor (props: CommentProps) {
    super()
    Object.assign(this, props)
  }

  static create (props: CommentProps): Comment {
    return new Comment(props)
  }
}
