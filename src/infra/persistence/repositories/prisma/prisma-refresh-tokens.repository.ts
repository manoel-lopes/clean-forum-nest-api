import { Injectable } from '@nestjs/common'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { PrismaRefreshTokenMapper } from '@/infra/persistence/mappers/prisma/prisma-refresh-token.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { RefreshToken, RefreshTokenProps } from '@/domain/enterprise/entities/refresh-token.entity'

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: RefreshTokenProps): Promise<RefreshToken> {
    const refreshToken = await this.prisma.refreshToken.create({ data })
    return PrismaRefreshTokenMapper.toDomain(refreshToken)
  }

  async findById (refreshTokenId: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: refreshTokenId },
    })
    if (!refreshToken) return null
    return PrismaRefreshTokenMapper.toDomain(refreshToken)
  }

  async findByUserId (userId: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { userId },
    })
    if (!refreshToken) return null
    return PrismaRefreshTokenMapper.toDomain(refreshToken)
  }

  async deleteManyByUserId (userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    })
  }
}
