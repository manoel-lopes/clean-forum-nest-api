import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { JWTService } from '@/infra/auth/jwt/jwt-service'
import { InMemoryRefreshTokensRepository } from '@/infra/persistence/repositories/in-memory/in-memory-refresh-tokens.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { makeRefreshTokenData } from '@/shared/util/factories/domain/make-refresh-token'
import { ExpiredRefreshTokenError } from './errors/expired-refresh-token.error'
import { RefreshAccessTokenUseCase } from './refresh-token.usecase'

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'development',
    JWT_SECRET: 'any_secret',
  },
}))

describe('RefreshAccessTokenUseCase', () => {
  let sut: RefreshAccessTokenUseCase
  let refreshTokensRepository: RefreshTokensRepository

  beforeEach(() => {
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new RefreshAccessTokenUseCase(refreshTokensRepository)
  })

  describe('RefreshTokenUseCase', () => {
    it('should throw an error when the refresh token is not found', async () => {
      await expect(
        sut.execute({
          refreshTokenId: 'non-existent-refresh-token-id',
        })
      ).rejects.toThrow(ResourceNotFoundError)
    })

    it('should throw an error when the refresh token is expired', async () => {
      const refreshTokenId = 'expired-refresh-token-id'
      const twoHoursAgo = new Date()
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
      await refreshTokensRepository.create(
        makeRefreshTokenData({
          id: refreshTokenId,
          expiresAt: twoHoursAgo,
        })
      )

      await expect(sut.execute({ refreshTokenId })).rejects.toThrow(ExpiredRefreshTokenError)
    })

    it('should refresh the access token successfully when the refresh token is valid', async () => {
      const refreshTokenId = 'valid-refresh-token-id'
      const expectedToken = 'new-jwt-token'
      vi.spyOn(JWTService, 'sign').mockReturnValue(expectedToken)
      await refreshTokensRepository.create(makeRefreshTokenData({ id: refreshTokenId }))

      const response = await sut.execute({ refreshTokenId })

      expect(response).toEqual({ token: expectedToken })
    })

    it('should not throw an error when the refresh token is not expired', async () => {
      const refreshTokenId = 'valid-refresh-token-id'
      await refreshTokensRepository.create(makeRefreshTokenData({ id: refreshTokenId }))

      await expect(sut.execute({ refreshTokenId })).resolves.not.toThrow()
    })

    it('should delete all user refresh tokens when token is expired', async () => {
      const userId = 'test-user-id'
      const refreshTokenId = 'expired-refresh-token-id'
      const twoHoursAgo = new Date()
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
      await refreshTokensRepository.create(
        makeRefreshTokenData({
          id: refreshTokenId,
          userId,
          expiresAt: twoHoursAgo,
        })
      )
      const deleteSpy = vi.spyOn(refreshTokensRepository, 'deleteManyByUserId')

      await expect(sut.execute({ refreshTokenId })).rejects.toThrow(ExpiredRefreshTokenError)

      expect(deleteSpy).toHaveBeenCalledWith(userId)
    })
  })
})
