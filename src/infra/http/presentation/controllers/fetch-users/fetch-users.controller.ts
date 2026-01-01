import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { Public } from '@/infra/auth/decorators/public.decorator'

type FetchUsersQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
}

@ApiTags('Users')
@Public()
@Controller('users')
export class FetchUsersController {
  constructor (@Inject(UsersRepository) private readonly usersRepository: UsersRepository) {}

  @Get()
  @ApiOperation({ summary: 'Fetch users' })
  async handle (@Query() query: FetchUsersQuery) {
    const { page, pageSize, order } = query
    return this.usersRepository.findMany({ page, pageSize, order })
  }
}
