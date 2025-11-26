import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { UpdateAnswerUseCase } from '@/domain/application/usecases/update-answer/update-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAnswerBody = {
  content: string
}

@Controller('answers/:answerId')
export class UpdateAnswerController {
  constructor (private readonly updateAnswerUseCase: UpdateAnswerUseCase) {}

  @Put()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('answerId') answerId: string,
    @Body() body: UpdateAnswerBody
  ) {
    try {
      const { content } = body
      const answer = await this.updateAnswerUseCase.execute({
        answerId,
        content,
        authorId: user.id,
      })
      return { answer }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof NotAuthorError) {
        throw new ForbiddenException(error.message)
      }
      throw error
    }
  }
}
