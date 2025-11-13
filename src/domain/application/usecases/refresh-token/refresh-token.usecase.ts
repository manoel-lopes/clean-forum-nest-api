import type { UseCase } from '@/core/domain/application/use-case'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { JWTService } from '@/infra/auth/jwt/jwt-service'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { ExpiredRefreshTokenError } from './errors/expired-refresh-token.error'

type RefreshAccessTokenRequest = {
  refreshTokenId: string
}

export type RefreshAccessTokenResponse = {
  token: string
}

export class RefreshAccessTokenUseCase implements UseCase {
  constructor (private readonly refreshTokensRepository: RefreshTokensRepository) {}

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
    const newToken = JWTService.sign(currentRefreshToken.userId)
    return { token: newToken }
  }
}
