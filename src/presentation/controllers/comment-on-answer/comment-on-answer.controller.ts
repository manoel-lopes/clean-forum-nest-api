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
import { CommentOnAnswerUseCase } from '@/domain/application/usecases/comment-on-answer/comment-on-answer.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CommentOnAnswerBody = {
  answerId: string
  content: string
}

@Controller('comments/answers')
export class CommentOnAnswerController {
  constructor (private readonly commentOnAnswerUseCase: CommentOnAnswerUseCase,
    private readonly jwtService: JwtService) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Headers('authorization') authorization: string,
    @Body() body: CommentOnAnswerBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      const { answerId, content } = body
      const response = await this.commentOnAnswerUseCase.execute({
        authorId,
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
