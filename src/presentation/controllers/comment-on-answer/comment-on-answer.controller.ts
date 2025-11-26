import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { CommentOnAnswerUseCase } from '@/domain/application/usecases/comment-on-answer/comment-on-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CommentOnAnswerBody = {
  answerId: string
  content: string
}

@Controller('comments/answers')
export class CommentOnAnswerController {
  constructor (private readonly commentOnAnswerUseCase: CommentOnAnswerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @CurrentUser() user: AuthUser,
    @Body() body: CommentOnAnswerBody
  ) {
    try {
      const { answerId, content } = body
      const response = await this.commentOnAnswerUseCase.execute({
        authorId: user.id,
        answerId,
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
