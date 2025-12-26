import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateAccountUseCase } from '@/domain/application/usecases/create-account/create-account.usecase'
import { UserWithEmailAlreadyRegisteredException } from '@/domain/application/usecases/create-account/exceptions/user-with-email-already-registered.exception'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  CreateAccountBodyDto,
  createAccountBodySchema,
} from '@/infra/http/ports/users/create-account.schema'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'

@ApiTags('Users')
@Controller('users')
export class CreateAccountController {
  constructor (private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Public()
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: CreateAccountBodyDto })
  @ApiCreatedResponse('Account created successfully')
  @ApiBadRequestResponse()
  @ApiConflictResponse('Conflict - email already registered')
  @ApiUnprocessableEntityResponse()
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
