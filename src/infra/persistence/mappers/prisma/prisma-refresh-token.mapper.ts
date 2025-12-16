import type { RefreshToken as PrismaRefreshToken } from '@prisma/client'
import type { RefreshToken as DomainRefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaRefreshTokenMapper {
  static toDomain (raw: PrismaRefreshToken): DomainRefreshToken {
    return {
      ...raw,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }
}
