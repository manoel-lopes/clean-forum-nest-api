import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('email_validations')
@Index('email_validations_email_idx', ['email'], { unique: true })
@Index('email_validations_createdAt_idx', ['createdAt'])
export class EmailValidationEntity extends BaseEntity {
  @Column({ type: 'text', unique: true })
  email: string

  @Column({ type: 'text' })
  code: string

  @Column({ type: 'timestamptz' })
  expiresAt: Date

  @Column({ type: 'boolean', default: false })
  isVerified: boolean
}
