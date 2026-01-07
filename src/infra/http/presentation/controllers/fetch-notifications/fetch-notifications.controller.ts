import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { FetchNotificationsUseCase } from '@/domain/application/usecases/fetch-notifications/fetch-notifications.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'

type FetchNotificationsQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
}

@ApiTags('Notifications')
@Controller('notifications')
export class FetchNotificationsController {
  constructor (private readonly fetchNotificationsUseCase: FetchNotificationsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Fetch notifications for current user' })
  @ApiOkResponse('Notifications fetched successfully')
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Query() query: FetchNotificationsQuery
  ) {
    const { page, pageSize, order } = query
    return this.fetchNotificationsUseCase.execute({
      recipientId: user.id,
      page,
      pageSize,
      order,
    })
  }
}
