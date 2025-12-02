import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateAccountUseCase } from '@/domain/application/usecases/create-account/create-account.usecase'
import { UserWithEmailAlreadyRegisteredException } from '@/domain/application/usecases/create-account/exceptions/user-with-email-already-registered.exception'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  CreateAccountBodyDto,
  createAccountBodySchema,
} from '@/infra/validation/schemas/presentation/users/create-account.schema'

@ApiTags('Users')
@Controller('users')
export class CreateAccountController {
  constructor (private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Public()
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: CreateAccountBodyDto })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Conflict - email already registered' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity - validation error' })
  async handle (@Body(new ZodValidationPipe(createAccountBodySchema)) body: CreateAccountBodyDto) {
    try {
      const { name, email, password } = body
      await this.createAccountUseCase.execute({ name, email, password })
    } catch (error) {
      if (error instanceof UserWithEmailAlreadyRegisteredException) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
