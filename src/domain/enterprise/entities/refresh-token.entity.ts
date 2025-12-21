import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { BaseEntity } from './base/base.entity'
import { User } from './user.entity'

export type RefreshTokenProps = Props<RefreshToken>

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  readonly userId: string

  @Column({ type: 'timestamptz' })
  readonly expiresAt: Date

  @ManyToOne(() => User, user => user.refreshTokens)
  @JoinColumn({ name: 'userId' })
  readonly user: User

  private constructor (props: RefreshTokenProps) {
    super()
    Object.assign(this, props)
  }

  static create (props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props)
  }
}
