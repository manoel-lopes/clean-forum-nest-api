import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UseCase } from '@/core/domain/use-case'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { PasswordHasher } from '@/infra/adapters/security/ports/password-hasher'
import { RefreshToken } from '@/domain/enterprise/entities/refresh-token/refresh-token.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { InvalidPasswordError } from './errors/invalid-password.error'

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
      throw new ResourceNotFoundError('User')
    }
    const doesPasswordMatch = await this.passwordHasher.compare(password, user.password)
    if (!doesPasswordMatch) {
      throw new InvalidPasswordError()
    }
    const token = this.jwtService.sign({ sub: user.id })
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const refreshToken = RefreshToken.create({ userId: user.id, expiresAt })
    await this.refreshTokensRepository.save(refreshToken)
    return { token, refreshToken }
  }
}
