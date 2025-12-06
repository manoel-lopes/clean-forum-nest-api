import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetUserByEmailUseCase } from '@/domain/application/usecases/get-user-by-email/get-user-by-email.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  GetUserByEmailParamsDto,
  getUserByEmailParamsSchema,
} from '@/infra/validation/schemas/presentation/users/get-user-by-email.schema'
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Users')
@Controller('users/email/:email')
export class GetUserByEmailController {
  constructor (private readonly getUserByEmailUseCase: GetUserByEmailUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiOkResponse('User found')
  @ApiNotFoundResponse('User not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (@Param(new ZodValidationPipe(getUserByEmailParamsSchema)) params: GetUserByEmailParamsDto) {
    const { email } = params
    try {
      const user = await this.getUserByEmailUseCase.execute({
        email,
      })
      return user
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
