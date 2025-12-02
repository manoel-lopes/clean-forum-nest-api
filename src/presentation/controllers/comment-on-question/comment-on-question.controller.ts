import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommentOnQuestionUseCase } from '@/domain/application/usecases/comment-on-question/comment-on-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type CommentOnQuestionBody,
  commentOnQuestionBodySchema,
} from '@/infra/validation/schemas/presentation/comments/comment-on-question.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Comments')
@Controller('comments/questions')
export class CommentOnQuestionController {
  constructor (private readonly commentOnQuestionUseCase: CommentOnQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(commentOnQuestionBodySchema)) body: CommentOnQuestionBody
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
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
