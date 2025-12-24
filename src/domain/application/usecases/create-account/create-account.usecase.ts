import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { PasswordHasher } from '@/infra/adapters/security/ports/password-hasher'
import { User, type UserProps } from '@/domain/enterprise/entities/user.entity'
import { UserWithEmailAlreadyRegisteredException } from './exceptions/user-with-email-already-registered.exception'

type CreateAccountRequest = UserProps

@Injectable()
export class CreateAccountUseCase implements UseCase {
  constructor (
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher
  ) {}

  async execute (req: CreateAccountRequest) {
    const { name, email, password } = req
    const userAlreadyExists = await this.usersRepository.findByEmail(email)
    if (userAlreadyExists) {
      throw new UserWithEmailAlreadyRegisteredException()
    }
    const hashedPassword = await this.passwordHasher.hash(password)
    await this.usersRepository.save(User.create({
      name,
      email,
      password: hashedPassword,
    }))
  }
}
