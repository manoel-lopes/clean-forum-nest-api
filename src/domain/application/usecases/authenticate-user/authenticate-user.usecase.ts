import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UseCase } from '@/core/domain/application/use-case'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { PasswordHasher } from '@/infra/adapters/security/ports/password-hasher'
import type { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'
import { InvalidPasswordException } from './exceptions/invalid-password.exception'

type AuthenticateUserRequest = {
  email: string
  password: string
}

export type AuthenticateUserResponse = {
  token: string
  refreshToken: RefreshToken
}

@Injectable()
export class AuthenticateUserUseCase implements UseCase {
  constructor (
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @Inject(RefreshTokensRepository) private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute (req: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const { email, password } = req
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new ResourceNotFoundException('User')
    }
    const doesPasswordMatch = await this.passwordHasher.compare(password, user.password)
    if (!doesPasswordMatch) {
      throw new InvalidPasswordException()
    }
    const token = this.jwtService.sign({ sub: user.id })
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const refreshToken = await this.refreshTokensRepository.create({ userId: user.id, expiresAt })
    return { token, refreshToken }
  }
}
