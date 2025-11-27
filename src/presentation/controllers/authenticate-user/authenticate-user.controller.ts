import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthenticateUserUseCase } from '@/domain/application/usecases/authenticate-user/authenticate-user.usecase'
import { InvalidPasswordError } from '@/domain/application/usecases/authenticate-user/errors/invalid-password.error'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type AuthenticateUserBody,
  authenticateUserBodySchema,
} from '@/infra/validation/schemas/presentation/auth/authenticate-user.schema'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Session')
@Controller('auth')
export class AuthenticateUserController {
  constructor (private readonly authenticateUserUseCase: AuthenticateUserUseCase) {}

  @Public()
  @Post()
  async handle (@Body(new ZodValidationPipe(authenticateUserBodySchema)) body: AuthenticateUserBody) {
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
