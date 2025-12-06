import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { AuthenticateUserUseCase } from '@/domain/application/usecases/authenticate-user/authenticate-user.usecase'
import { InvalidPasswordException } from '@/domain/application/usecases/authenticate-user/exceptions/invalid-password.exception'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  AuthenticateUserBodyDto,
  authenticateUserBodySchema,
} from '@/infra/validation/schemas/presentation/auth/authenticate-user.schema'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Session')
@Controller('auth')
export class AuthenticateUserController {
  constructor (private readonly authenticateUserUseCase: AuthenticateUserUseCase) {}

  @Public()
  @Post()
  @ApiBody({ type: AuthenticateUserBodyDto })
  @ApiCreatedResponse('User authenticated successfully')
  @ApiUnauthorizedResponse('Invalid password')
  @ApiNotFoundResponse('User not found')
  @ApiInternalServerErrorResponse()
  async handle (@Body(new ZodValidationPipe(authenticateUserBodySchema)) body: AuthenticateUserBodyDto) {
    try {
      const { email, password } = body
      const response = await this.authenticateUserUseCase.execute({
        email,
        password,
      })
      return response
    } catch (error) {
      if (error instanceof InvalidPasswordException) {
        throw new UnauthorizedException(error.message)
      }
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
