import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { DeleteAccountUseCase } from '@/domain/application/usecases/delete-account/delete-account.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import {
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Users')
@Controller('users')
export class DeleteAccountController {
  constructor (private readonly deleteAccountUseCase: DeleteAccountUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiNoContentResponse('Account deleted successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('User not found')
  @ApiInternalServerErrorResponse()
  async handle (@CurrentUser() user: AuthUser) {
    try {
      await this.deleteAccountUseCase.execute({ userId: user.id })
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found')
      }
      throw error
    }
  }
}
