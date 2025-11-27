import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DeleteAccountUseCase } from '@/domain/application/usecases/delete-account/delete-account.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { Prisma } from '@prisma/client'

@ApiTags('Users')
@Controller('users')
export class DeleteAccountController {
  constructor (private readonly deleteAccountUseCase: DeleteAccountUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle (@CurrentUser() user: AuthUser) {
    try {
      await this.deleteAccountUseCase.execute({ userId: user.id })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found')
      }
      throw error
    }
  }
}
