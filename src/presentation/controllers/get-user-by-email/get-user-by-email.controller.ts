import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { GetUserByEmailUseCase } from '@/domain/application/usecases/get-user-by-email/get-user-by-email.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Public()
@Controller('users/email/:email')
export class GetUserByEmailController {
  constructor (private readonly getUserByEmailUseCase: GetUserByEmailUseCase) {}

  @Get()
  async handle (@Param('email') email: string) {
    try {
      const user = await this.getUserByEmailUseCase.execute({
        email,
      })
      return user
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
