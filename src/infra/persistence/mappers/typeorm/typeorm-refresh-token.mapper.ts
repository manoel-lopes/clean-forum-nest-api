import { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'

export class TypeOrmRefreshTokenMapper {
  static toDomain (raw: RefreshToken): RefreshToken {
    return RefreshToken.create({
      userId: raw.userId,
      expiresAt: raw.expiresAt,
    }, raw.id)
  }
}
