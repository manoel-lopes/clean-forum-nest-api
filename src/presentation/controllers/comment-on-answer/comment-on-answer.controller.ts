import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CommentOnAnswerUseCase } from '@/domain/application/usecases/comment-on-answer/comment-on-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  CommentOnAnswerBodyDto,
  commentOnAnswerBodySchema,
} from '@/infra/validation/schemas/presentation/comments/comment-on-answer.schema'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Comments')
@Controller('comments/answers')
export class CommentOnAnswerController {
  constructor (private readonly commentOnAnswerUseCase: CommentOnAnswerUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Comment on an answer' })
  @ApiCreatedResponse('Comment created successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Answer not found')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(commentOnAnswerBodySchema)) body: CommentOnAnswerBodyDto
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
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
