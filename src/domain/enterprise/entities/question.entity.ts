import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Optional } from '@/shared/types/common/optional'
import { Props } from '@/shared/types/custom/props'
import { Slug } from '../value-objects/slug/slug.vo'
import { Answer } from './answer.entity'
import { Attachment } from './base/attachment.entity'
import { BaseEntity } from './base/base.entity'
import { Comment } from './base/comment.entity'
import { User } from './user.entity'

export type QuestionProps = Optional<Props<Question>, 'slug'>

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ type: 'text' })
  readonly title: string

  @Column({ type: 'text', unique: true })
  readonly slug: string

  @Column({ type: 'text' })
  readonly content: string

  @Column({ type: 'varchar', length: 36 })
  readonly authorId: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  readonly bestAnswerId?: string

  @ManyToOne(() => User, user => user.questions)
  @JoinColumn({ name: 'authorId' })
  readonly author: User

  @OneToMany(() => Answer, answer => answer.question)
  readonly answers: Answer[]

  @OneToMany(() => Comment, comment => comment.question)
  readonly comments: Comment[]

  @OneToMany(() => Attachment, attachment => attachment.question)
  readonly attachments: Attachment[]

  private constructor (props: QuestionProps) {
    super()
    Object.assign(this, props)
  }

  static create (props: QuestionProps): Question {
    const slug = Slug.create(props.title)
    const questionSlug = props.slug ?? slug.value
    return new Question({ ...props, slug: questionSlug })
  }
}
