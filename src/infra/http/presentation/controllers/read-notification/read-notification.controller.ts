import {
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { NotRecipientError } from '@/domain/application/usecases/read-notification/not-recipient.error'
import { ReadNotificationUseCase } from '@/domain/application/usecases/read-notification/read-notification.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Notifications')
@Controller('notifications')
export class ReadNotificationController {
  constructor (private readonly readNotificationUseCase: ReadNotificationUseCase) {}

  @Patch(':notificationId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiOkResponse('Notification marked as read')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Notification not found')
  @ApiForbiddenResponse('User is not the recipient')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('notificationId') notificationId: string
  ) {
    try {
      return await this.readNotificationUseCase.execute({
        notificationId,
        recipientId: user.id,
      })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof NotRecipientError) {
        throw new ForbiddenException(error.message)
      }
      throw error
    }
  }
}
