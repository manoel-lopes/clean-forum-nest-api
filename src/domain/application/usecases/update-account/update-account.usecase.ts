import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { type UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { PasswordHasher } from '@/infra/adapters/security/ports/password-hasher'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type UpdateAccountRequest = UpdateUserData['data'] & {
  userId: string
}

@Injectable()
export class UpdateAccountUseCase implements UseCase {
  constructor (
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher
  ) {}

  async execute (req: UpdateAccountRequest): Promise<User> {
    const { userId, name, email, password } = req
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundException('User')
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
