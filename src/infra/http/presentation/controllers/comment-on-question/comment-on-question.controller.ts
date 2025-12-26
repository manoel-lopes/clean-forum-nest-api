import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CommentOnQuestionUseCase } from '@/domain/application/usecases/comment-on-question/comment-on-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  CommentOnQuestionBodyDto,
  commentOnQuestionBodySchema,
} from '@/infra/http/ports/comments/comment-on-question.schema'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Comments')
@Controller('comments/questions')
export class CommentOnQuestionController {
  constructor (private readonly commentOnQuestionUseCase: CommentOnQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Comment on a question' })
  @ApiCreatedResponse('Comment created successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Question not found')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(commentOnQuestionBodySchema)) body: CommentOnQuestionBodyDto
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
