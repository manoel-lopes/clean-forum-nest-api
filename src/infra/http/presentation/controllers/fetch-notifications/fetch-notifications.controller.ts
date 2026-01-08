import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { FetchNotificationsUseCase } from '@/domain/application/usecases/fetch-notifications/fetch-notifications.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import {
  FetchNotificationsQueryDto,
  fetchNotificationsQuerySchema,
} from './ports/fetch-notifications.protocol'

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
    @Query(new ZodValidationPipe(fetchNotificationsQuerySchema)) query: FetchNotificationsQueryDto
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
