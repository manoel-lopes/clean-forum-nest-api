import type { RefreshToken as PrismaRefreshToken } from '@prisma/client'
import type { RefreshToken as DomainRefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'

export class PrismaRefreshTokenMapper {
  static toDomain (raw: PrismaRefreshToken): DomainRefreshToken {
    return {
      ...raw,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
  }
}
