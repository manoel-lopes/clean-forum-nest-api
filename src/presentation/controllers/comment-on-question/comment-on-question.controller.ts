import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { CommentOnQuestionUseCase } from '@/domain/application/usecases/comment-on-question/comment-on-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CommentOnQuestionBody = {
  questionId: string
  content: string
}

@Controller('comments/questions')
export class CommentOnQuestionController {
  constructor (private readonly commentOnQuestionUseCase: CommentOnQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @CurrentUser() user: AuthUser,
    @Body() body: CommentOnQuestionBody
  ) {
    try {
      const { questionId, content } = body
      const response = await this.commentOnQuestionUseCase.execute({
        authorId: user.id,
        questionId,
        content,
      })
      return response
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
