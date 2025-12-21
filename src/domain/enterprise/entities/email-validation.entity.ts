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

  private constructor (props: EmailValidationProps & { code: string }) {
    super()
    Object.assign(this, props)
  }

  static create (props: EmailValidationProps): EmailValidation {
    const validationCode = EmailValidationCode.create()
    const code = validationCode.value
    return new EmailValidation({ ...props, code })
  }
}
