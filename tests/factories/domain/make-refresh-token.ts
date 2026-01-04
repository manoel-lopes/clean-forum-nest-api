import { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token/refresh-token.entity'
import { faker } from '@faker-js/faker'

export function makeRefreshToken (override: Partial<RefreshTokenProps> = {}): RefreshToken {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
  const props: RefreshTokenProps = {
    userId: faker.string.uuid(),
    expiresAt,
    ...override,
  }
  return RefreshToken.create(props)
}
