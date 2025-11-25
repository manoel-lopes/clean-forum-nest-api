import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { type UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { PASSWORD_HASHER } from '@/infra/adapters/security/security.module'
import type { PasswordHasher } from '@/infra/adapters/security/ports/password-hasher'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAccountRequest = UpdateUserData['data'] & {
  userId: string
}

@Injectable()
export class UpdateAccountUseCase implements UseCase {
  constructor (
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher
  ) {
    Object.freeze(this)
  }

  async execute (req: UpdateAccountRequest): Promise<User> {
    const { userId, name, email, password } = req
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User')
    }
    const updatedUser = await this.usersRepository.update({
      where: { id: userId },
      data: {
        name,
        email,
        password: password && (await this.passwordHasher.hash(password)),
      },
    })
    return updatedUser
  }
}
