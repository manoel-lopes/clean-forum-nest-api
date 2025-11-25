import {
  Body,
  ForbiddenException,
  Headers,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UseCase } from '@/core/domain/application/use-case'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateCommentBody = {
  content: string
}

export abstract class BaseUpdateCommentController {
  constructor (
    protected readonly updateCommentUseCase: UseCase,
    protected readonly jwtService: JwtService
  ) {}

  @Put()
  async handle (
    @Headers('authorization') authorization: string,
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      const { content } = body
      const response = await this.updateCommentUseCase.execute({
        commentId,
        authorId,
        content,
      })
      return response
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
