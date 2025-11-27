import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { UpdateQuestionUseCase } from '@/domain/application/usecases/update-question/update-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateQuestionBody = {
  title: string
  content: string
}

@Controller('questions/:questionId')
export class UpdateQuestionController {
  constructor (private readonly updateQuestionUseCase: UpdateQuestionUseCase) {}

  @Put()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('questionId') questionId: string,
    @Body() body: UpdateQuestionBody
  ) {
    try {
      const { title, content } = body
      const question = await this.updateQuestionUseCase.execute({
        questionId,
        title,
        content,
        authorId: user.id,
      })
      return { question }
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
