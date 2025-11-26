import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { Public } from '@/infra/auth/decorators/public.decorator'

type FetchUsersQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
}

@Public()
@Controller('users')
export class FetchUsersController {
  constructor (@Inject(UsersRepository) private readonly usersRepository: UsersRepository) {}

  @Get()
  async handle (@Query() query: FetchUsersQuery) {
    const { page, pageSize, order } = query
    const users = await this.usersRepository.findMany({ page, pageSize, order })
    const sanitizedUsers = {
      ...users,
      items: users.items.map(user => {
        const { password: _password, ...userWithoutPassword } = user
        return userWithoutPassword
      }),
    }
    return sanitizedUsers
  }
}
