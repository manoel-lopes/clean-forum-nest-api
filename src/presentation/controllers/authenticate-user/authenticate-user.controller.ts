import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthenticateUserUseCase } from '@/domain/application/usecases/authenticate-user/authenticate-user.usecase'
import { InvalidPasswordError } from '@/domain/application/usecases/authenticate-user/errors/invalid-password.error'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AuthenticateUserBody = {
  email: string
  password: string
}

@Controller('auth')
export class AuthenticateUserController {
  constructor (private readonly authenticateUserUseCase: AuthenticateUserUseCase) {}

  @Public()
  @Post()
  async handle (@Body() body: AuthenticateUserBody) {
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
