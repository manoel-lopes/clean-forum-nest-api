import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ExpiredRefreshTokenException } from '@/domain/application/usecases/refresh-token/errors/expired-refresh-token.exception'
import { RefreshAccessTokenUseCase } from '@/domain/application/usecases/refresh-token/refresh-token.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  RefreshTokenBodyDto,
  refreshTokenBodySchema,
} from '@/infra/validation/schemas/presentation/auth/refresh-token.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Session')
@Controller('auth/refresh')
export class RefreshAccessTokenController {
  constructor (private readonly refreshTokenUseCase: RefreshAccessTokenUseCase) {}

  @Public()
  @Post()
  async handle (@Body(new ZodValidationPipe(refreshTokenBodySchema)) body: RefreshTokenBodyDto) {
    try {
      const { refreshTokenId } = body
      const response = await this.refreshTokenUseCase.execute({ refreshTokenId })
      return response
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof ExpiredRefreshTokenException) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
