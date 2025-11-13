import type { UseCase } from '@/core/domain/application/use-case'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type GetUserByEmailUseCaseRequest = {
  email: string
}

type GetUserByEmailUseCaseResponse = Omit<User, 'password'>

export class GetUserByEmailUseCase implements UseCase {
  constructor (private readonly usersRepository: UsersRepository) {}

  async execute ({ email }: GetUserByEmailUseCaseRequest): Promise<GetUserByEmailUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new ResourceNotFoundError('User')
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
