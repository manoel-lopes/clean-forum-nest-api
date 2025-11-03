import type { Entity } from '@/core/domain/entity'
import type { Props } from '@/shared/types/custom/props'

export type RefreshTokenProps = Props<RefreshToken>

export interface RefreshToken extends Entity {
  userId: string
  expiresAt: Date
}
