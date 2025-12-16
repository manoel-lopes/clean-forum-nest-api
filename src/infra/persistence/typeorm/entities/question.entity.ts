import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AnswerEntity } from './answer.entity'
import { AttachmentEntity } from './attachment.entity'
import { BaseEntity } from './base.entity'
import { CommentEntity } from './comment.entity'
import { UserEntity } from './user.entity'

@Entity('questions')
@Index('questions_authorId_idx', ['authorId'])
@Index('questions_createdAt_idx', ['createdAt'])
@Index('questions_slug_idx', ['slug'], { unique: true })
export class QuestionEntity extends BaseEntity {
  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text', unique: true })
  slug: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'varchar', length: 36 })
  authorId: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  bestAnswerId: string | null

  @ManyToOne(() => UserEntity, user => user.questions)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity

  @OneToMany(() => AnswerEntity, answer => answer.question)
  answers: AnswerEntity[]

  @OneToMany(() => CommentEntity, comment => comment.question)
  comments: CommentEntity[]

  @OneToMany(() => AttachmentEntity, attachment => attachment.question)
  attachments: AttachmentEntity[]
}
