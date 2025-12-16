import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { AnswerEntity } from './answer.entity'
import { QuestionEntity } from './question.entity'
import { UserEntity } from './user.entity'

@Entity('comments')
@Index('comments_questionId_idx', ['questionId'])
@Index('comments_answerId_idx', ['answerId'])
@Index('comments_authorId_idx', ['authorId'])
@Index('comments_createdAt_idx', ['createdAt'])
@Index('comments_questionId_createdAt_idx', ['questionId', 'createdAt'])
@Index('comments_answerId_createdAt_idx', ['answerId', 'createdAt'])
export class CommentEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'varchar', length: 36 })
  authorId: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  questionId: string | null

  @Column({ type: 'varchar', length: 36, nullable: true })
  answerId: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null

  @ManyToOne(() => UserEntity, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity

  @ManyToOne(() => QuestionEntity, question => question.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity | null

  @ManyToOne(() => AnswerEntity, answer => answer.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answerId' })
  answer: AnswerEntity | null

  @BeforeInsert()
  generateId (): void {
    if (!this.id) {
      this.id = uuidv7()
    }
    this.createdAt = this.createdAt || new Date()
  }

  @BeforeUpdate()
  updateTimestamp (): void {
    this.updatedAt = new Date()
  }
}
