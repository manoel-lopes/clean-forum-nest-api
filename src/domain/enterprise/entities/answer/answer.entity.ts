import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Optional } from '@/shared/types/common/optional'
import { Props } from '@/shared/types/custom/props'
import { AnswerAttachment } from '../answer-attachment/answer-attachment.entity'
import { BaseEntity } from '../base/base.entity'
import { Comment } from '../comment/comment.entity'
import { Question } from '../question/question.entity'
import { User } from '../user/user.entity'

export type AnswerProps = Optional<Props<Answer>, 'excerpt'>

@Entity('answers')
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

  @OneToMany('AnswerAttachment', 'answer')
  readonly attachments: AnswerAttachment[]

  private constructor (props: AnswerProps) {
    super()
    Object.assign(this, props)
  }

  static create (props: AnswerProps): Answer {
    const excerpt = props.excerpt ?? props.content.substring(0, 45).replace(/ $/, '').concat('...')
    return new Answer({ ...props, excerpt })
  }
}
