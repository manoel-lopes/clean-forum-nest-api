import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { AnswerEntity } from './answer.entity'
import { QuestionEntity } from './question.entity'

@Entity('attachments')
@Index('attachments_questionId_idx', ['questionId'])
@Index('attachments_answerId_idx', ['answerId'])
@Index('attachments_createdAt_idx', ['createdAt'])
@Index('attachments_questionId_createdAt_idx', ['questionId', 'createdAt'])
@Index('attachments_answerId_createdAt_idx', ['answerId', 'createdAt'])
export class AttachmentEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text' })
  link: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  questionId: string | null

  @Column({ type: 'varchar', length: 36, nullable: true })
  answerId: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null

  @ManyToOne(() => QuestionEntity, question => question.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity | null

  @ManyToOne(() => AnswerEntity, answer => answer.attachments, { onDelete: 'CASCADE' })
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
