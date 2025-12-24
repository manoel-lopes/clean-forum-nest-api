import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type GetUserByEmailUseCaseRequest = {
  email: string
}

type GetUserByEmailUseCaseResponse = Omit<User, 'password' | 'questions' | 'answers' | 'comments' | 'refreshTokens'>

@Injectable()
export class GetUserByEmailUseCase implements UseCase {
  constructor (
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository
  ) {}

  async execute ({ email }: GetUserByEmailUseCaseRequest): Promise<GetUserByEmailUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new ResourceNotFoundException('User')
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
