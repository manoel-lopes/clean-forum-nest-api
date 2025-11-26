import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ExpiredRefreshTokenError } from '@/domain/application/usecases/refresh-token/errors/expired-refresh-token.error'
import { RefreshAccessTokenUseCase } from '@/domain/application/usecases/refresh-token/refresh-token.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type RefreshTokenBody = {
  refreshTokenId: string
}

@Controller('auth/refresh')
export class RefreshAccessTokenController {
  constructor (private readonly refreshTokenUseCase: RefreshAccessTokenUseCase) {}

  @Public()
  @Post()
  async handle (@Body() body: RefreshTokenBody) {
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
