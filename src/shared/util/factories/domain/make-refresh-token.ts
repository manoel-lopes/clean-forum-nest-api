import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'
import { faker } from '@faker-js/faker'

export function makeRefreshTokenData (override: Partial<RefreshToken> = {}): RefreshTokenProps {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
  const refreshToken: RefreshTokenProps = {
    userId: faker.string.uuid(),
    expiresAt,
  }
  return Object.assign(refreshToken, override)
}
