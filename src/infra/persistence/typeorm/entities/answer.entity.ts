import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AttachmentEntity } from './attachment.entity'
import { BaseEntity } from './base.entity'
import { CommentEntity } from './comment.entity'
import { QuestionEntity } from './question.entity'
import { UserEntity } from './user.entity'

@Entity('answers')
@Index('answers_questionId_idx', ['questionId'])
@Index('answers_authorId_idx', ['authorId'])
@Index('answers_createdAt_idx', ['createdAt'])
@Index('answers_questionId_createdAt_idx', ['questionId', 'createdAt'])
export class AnswerEntity extends BaseEntity {
  @Column({ type: 'text' })
  content: string

  @Column({ type: 'varchar', length: 36 })
  authorId: string

  @Column({ type: 'varchar', length: 36 })
  questionId: string

  @Column({ type: 'text' })
  excerpt: string

  @ManyToOne(() => UserEntity, user => user.answers)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity

  @ManyToOne(() => QuestionEntity, question => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity

  @OneToMany(() => CommentEntity, comment => comment.answer)
  comments: CommentEntity[]

  @OneToMany(() => AttachmentEntity, attachment => attachment.answer)
  attachments: AttachmentEntity[]
}
