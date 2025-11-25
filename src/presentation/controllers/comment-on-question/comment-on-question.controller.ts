import {
  Body,
  Controller,
  Headers,
  HttpCode,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CommentOnQuestionUseCase } from '@/domain/application/usecases/comment-on-question/comment-on-question.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CommentOnQuestionBody = {
  questionId: string
  content: string
}

@Controller('comments/questions')
export class CommentOnQuestionController {
  constructor (private readonly commentOnQuestionUseCase: CommentOnQuestionUseCase,
    private readonly jwtService: JwtService) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Headers('authorization') authorization: string,
    @Body() body: CommentOnQuestionBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      const { questionId, content } = body
      const response = await this.commentOnQuestionUseCase.execute({
        authorId,
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
