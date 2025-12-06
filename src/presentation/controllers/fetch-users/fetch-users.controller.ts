import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@/presentation/decorators/api-responses.decorator'

type FetchUsersQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
}

@ApiTags('Users')
@Controller('users')
export class FetchUsersController {
  constructor (@Inject(UsersRepository) private readonly usersRepository: UsersRepository) {}

  @Get()
  @ApiOperation({ summary: 'Fetch users with pagination' })
  @ApiOkResponse('Users fetched successfully')
  @ApiInternalServerErrorResponse()
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
