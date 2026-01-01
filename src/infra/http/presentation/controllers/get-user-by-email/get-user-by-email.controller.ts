import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetUserByEmailUseCase } from '@/domain/application/usecases/get-user-by-email/get-user-by-email.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  GetUserByEmailParamsDto,
  getUserByEmailParamsSchema,
} from './ports/get-user-by-email.protocol'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Users')
@Public()
@Controller('users/email/:email')
export class GetUserByEmailController {
  constructor (private readonly getUserByEmailUseCase: GetUserByEmailUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get user by email' })
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
