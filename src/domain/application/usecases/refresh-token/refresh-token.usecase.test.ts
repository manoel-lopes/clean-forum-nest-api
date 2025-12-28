import { JwtService } from '@nestjs/jwt'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { InMemoryRefreshTokensRepository } from '@/infra/persistence/repositories/in-memory/in-memory-refresh-tokens.repository'
import { RefreshAccessTokenUseCase } from './refresh-token.usecase'
import { makeRefreshTokenData } from '@tests/factories/domain/make-refresh-token'

vi.mock('@/infra/env/env', () => ({
  env: {
    NODE_ENV: 'development',
    JWT_SECRET: 'any_secret',
  },
}))

describe('RefreshAccessTokenUseCase', () => {
  let sut: RefreshAccessTokenUseCase
  let refreshTokensRepository: RefreshTokensRepository
  let jwtService: JwtService

  beforeEach(() => {
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    jwtService = Object.create(JwtService.prototype)
    jwtService.sign = vi.fn()
    jwtService.verify = vi.fn()
    sut = new RefreshAccessTokenUseCase(refreshTokensRepository, jwtService)
  })

  it('should throw an error when the refresh token is not found', async () => {
    const request = {
      refreshTokenId: 'non-existent-refresh-token-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Refresh token not found')
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

    const request = { refreshTokenId }

    await expect(sut.execute(request)).rejects.toThrow('The refresh token has expired')
  })

  it('should refresh the access token successfully when the refresh token is valid', async () => {
    const refreshTokenId = 'valid-refresh-token-id'
    const userId = 'test-user-id'
    const expectedToken = 'new-jwt-token'
    vi.mocked(jwtService.sign).mockReturnValue(expectedToken)
    await refreshTokensRepository.create(makeRefreshTokenData({ id: refreshTokenId, userId }))

    const response = await sut.execute({ refreshTokenId })

    expect(response).toEqual({ token: expectedToken })
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: userId })
  })

  it('should not throw an error when the refresh token is not expired', async () => {
    const refreshTokenId = 'valid-refresh-token-id'
    await refreshTokensRepository.create(makeRefreshTokenData({ id: refreshTokenId }))

    const request = { refreshTokenId }

    await expect(sut.execute(request)).resolves.not.toThrow()
  })

  it('should not consider token expired when expiresAt equals current time', async () => {
    const refreshTokenId = 'boundary-refresh-token-id'
    const now = new Date()
    vi.setSystemTime(now)
    await refreshTokensRepository.create(
      makeRefreshTokenData({
        id: refreshTokenId,
        expiresAt: now,
      })
    )

    const request = { refreshTokenId }

    await expect(sut.execute(request)).resolves.not.toThrow()
    vi.useRealTimers()
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

    const request = { refreshTokenId }

    await expect(sut.execute(request)).rejects.toThrow('The refresh token has expired')
    expect(deleteSpy).toHaveBeenCalledWith(userId)
  })
})
