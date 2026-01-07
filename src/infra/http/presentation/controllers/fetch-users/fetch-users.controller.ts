import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  FetchUsersQueryDto,
  fetchUsersQuerySchema,
} from './ports/fetch-users.protocol'

@ApiTags('Users')
@Public()
@Controller('users')
export class FetchUsersController {
  constructor (@Inject(UsersRepository) private readonly usersRepository: UsersRepository) {}

  @Get()
  @ApiOperation({ summary: 'Fetch users' })
  async handle (@Query(new ZodValidationPipe(fetchUsersQuerySchema)) query: FetchUsersQueryDto) {
    const { page, pageSize, order } = query
    return this.usersRepository.findMany({ page, pageSize, order })
  }
}
