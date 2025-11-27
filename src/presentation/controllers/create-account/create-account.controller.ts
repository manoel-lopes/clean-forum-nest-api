import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { CreateAccountUseCase } from '@/domain/application/usecases/create-account/create-account.usecase'
import { UserWithEmailAlreadyRegisteredError } from '@/domain/application/usecases/create-account/errors/user-with-email-already-registered.error'
import { Public } from '@/infra/auth/decorators/public.decorator'

type CreateAccountBody = {
  name: string
  email: string
  password: string
}

@Controller('users')
export class CreateAccountController {
  constructor (private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Public()
  @Post()
  @HttpCode(201)
  async handle (@Body() body: CreateAccountBody) {
    try {
      const { name, email, password } = body
      await this.createAccountUseCase.execute({ name, email, password })
    } catch (error) {
      if (error instanceof UserWithEmailAlreadyRegisteredError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
