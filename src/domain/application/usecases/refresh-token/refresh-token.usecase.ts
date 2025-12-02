import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UseCase } from '@/core/domain/application/use-case'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { ExpiredRefreshTokenException } from './errors/expired-refresh-token.exception'

type RefreshAccessTokenRequest = {
  refreshTokenId: string
}

export type RefreshAccessTokenResponse = {
  token: string
}

@Injectable()
export class RefreshAccessTokenUseCase implements UseCase {
  constructor (
    @Inject(RefreshTokensRepository) private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute (req: RefreshAccessTokenRequest): Promise<RefreshAccessTokenResponse> {
    const { refreshTokenId } = req
    const currentRefreshToken = await this.refreshTokensRepository.findById(refreshTokenId)
    if (!currentRefreshToken) {
      throw new ResourceNotFoundException('Refresh token')
    }
    const { userId } = currentRefreshToken
    const isExpired = currentRefreshToken.expiresAt < new Date()
    if (isExpired) {
      await this.refreshTokensRepository.deleteManyByUserId(userId)
      throw new ExpiredRefreshTokenException()
    }
    const newToken = this.jwtService.sign({ sub: currentRefreshToken.userId })
    return { token: newToken }
  }
}
