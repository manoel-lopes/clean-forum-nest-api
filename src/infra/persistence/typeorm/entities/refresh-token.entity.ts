import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { UserEntity } from './user.entity'

@Entity('refresh_tokens')
@Index('refresh_tokens_userId_idx', ['userId'])
@Index('refresh_tokens_expiresAt_idx', ['expiresAt'])
export class RefreshTokenEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  userId: string

  @Column({ type: 'timestamptz' })
  expiresAt: Date

  @ManyToOne(() => UserEntity, user => user.refreshTokens)
  @JoinColumn({ name: 'userId' })
  user: UserEntity
}
