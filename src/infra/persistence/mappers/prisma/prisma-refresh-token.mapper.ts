import type { RefreshToken as DomainRefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import type { RefreshToken as PrismaRefreshToken } from '@prisma/client'

export class PrismaRefreshTokenMapper {
  static toDomain (raw: PrismaRefreshToken): DomainRefreshToken {
    return {
      ...raw,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
  }
}
