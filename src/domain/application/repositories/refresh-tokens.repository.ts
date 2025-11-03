import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'

export type RefreshTokensRepository = {
  create(refreshToken: RefreshTokenProps): Promise<RefreshToken>
  findById(id: string): Promise<RefreshToken | null>
  findByUserId(userId: string): Promise<RefreshToken | null>
  deleteManyByUserId(userId: string): Promise<void>
}
