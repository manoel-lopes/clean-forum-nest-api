import { Column, Entity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { EmailValidationCode } from '../value-objects/email-validation-code/email-validation-code.vo'
import { BaseEntity } from './base/base.entity'

export type EmailValidationProps = Omit<Props<EmailValidation>, 'code'>

@Entity('email_validations')
export class EmailValidation extends BaseEntity {
  @Column({ type: 'text', unique: true })
  readonly email: string

  @Column({ type: 'text' })
  readonly code: string

  @Column({ type: 'timestamptz' })
  readonly expiresAt: Date

  @Column({ type: 'boolean', default: false })
  readonly isVerified: boolean

  private constructor (props: Omit<EmailValidation, 'id'>, id?: string) {
    super(id)
    Object.assign(this, props)
  }

  static create (props: EmailValidationProps, id?: string): EmailValidation {
    const validationCode = EmailValidationCode.create()
    const code = validationCode.value
    return new EmailValidation({ ...props, code }, id)
  }
}
