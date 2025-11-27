import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ExpiredRefreshTokenError } from '@/domain/application/usecases/refresh-token/errors/expired-refresh-token.error'
import { RefreshAccessTokenUseCase } from '@/domain/application/usecases/refresh-token/refresh-token.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type RefreshTokenBody,
  refreshTokenBodySchema,
} from '@/infra/validation/schemas/presentation/auth/refresh-token.schema'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Session')
@Controller('auth/refresh')
export class RefreshAccessTokenController {
  constructor (private readonly refreshTokenUseCase: RefreshAccessTokenUseCase) {}

  @Public()
  @Post()
  async handle (@Body(new ZodValidationPipe(refreshTokenBodySchema)) body: RefreshTokenBody) {
    try {
      const { refreshTokenId } = body
      const response = await this.refreshTokenUseCase.execute({ refreshTokenId })
      return response
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof ExpiredRefreshTokenError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
