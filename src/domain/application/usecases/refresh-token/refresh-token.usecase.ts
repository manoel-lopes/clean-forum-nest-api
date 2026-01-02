import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UseCase } from '@/core/domain/use-case'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { ExpiredRefreshTokenError } from './errors/expired-refresh-token.error'

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
      throw new ResourceNotFoundError('Refresh token')
    }
    const { userId } = currentRefreshToken
    const isExpired = currentRefreshToken.expiresAt < new Date()
    if (isExpired) {
      await this.refreshTokensRepository.deleteManyByUserId(userId)
      throw new ExpiredRefreshTokenError()
    }
    const newToken = this.jwtService.sign({ sub: currentRefreshToken.userId })
    return { token: newToken }
  }
}
