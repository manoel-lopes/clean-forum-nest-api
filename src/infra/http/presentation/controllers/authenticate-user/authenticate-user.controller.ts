import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthenticateUserUseCase } from '@/domain/application/usecases/authenticate-user/authenticate-user.usecase'
import { InvalidPasswordError } from '@/domain/application/usecases/authenticate-user/errors/invalid-password.error'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  AuthenticateUserBodyDto,
  authenticateUserBodySchema,
} from '@/infra/http/ports/auth/authenticate-user.schema'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Session')
@Controller('auth')
export class AuthenticateUserController {
  constructor (private readonly authenticateUserUseCase: AuthenticateUserUseCase) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiBody({ type: AuthenticateUserBodyDto })
  @ApiResponse({ status: 201, description: 'User authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handle (@Body(new ZodValidationPipe(authenticateUserBodySchema)) body: AuthenticateUserBodyDto) {
    try {
      const { email, password } = body
      const response = await this.authenticateUserUseCase.execute({
        email,
        password,
      })
      return response
    } catch (error) {
      if (error instanceof InvalidPasswordError) {
        throw new UnauthorizedException(error.message)
      }
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
