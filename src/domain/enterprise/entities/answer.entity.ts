import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Optional } from '@/shared/types/common/optional'
import { Props } from '@/shared/types/custom/props'
import { Attachment } from './base/attachment.entity'
import { BaseEntity } from './base/base.entity'
import { Comment } from './comment.entity'
import { Question } from './question.entity'
import { User } from './user.entity'

export type AnswerProps = Optional<Props<Answer>, 'excerpt'>

@Entity('answers')
@Index('answers_questionId_idx', ['questionId'])
@Index('answers_authorId_idx', ['authorId'])
@Index('answers_createdAt_idx', ['createdAt'])
@Index('answers_questionId_createdAt_idx', ['questionId', 'createdAt'])
export class Answer extends BaseEntity {
  @Column({ type: 'text' })
  readonly content: string

  @Column({ type: 'varchar', length: 36 })
  readonly authorId: string

  @Column({ type: 'varchar', length: 36 })
  readonly questionId: string

  @Column({ type: 'text' })
  readonly excerpt: string

  @ManyToOne(() => User, user => user.answers)
  @JoinColumn({ name: 'authorId' })
  readonly author: User

  @ManyToOne(() => Question, question => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  readonly question: Question

  @OneToMany(() => Comment, comment => comment.answer)
  readonly comments: Comment[]

  @OneToMany(() => Attachment, attachment => attachment.answer)
  readonly attachments: Attachment[]

  private constructor (props: AnswerProps) {
    super()
    Object.assign(this, props)
  }

  static create (props: AnswerProps): Answer {
    const excerpt = props.excerpt ?? props.content.substring(0, 45).replace(/ $/, '').concat('...')
    return new Answer({ ...props, excerpt })
  }
}
