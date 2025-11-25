import {
  Delete,
  ForbiddenException,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UseCase } from '@/core/domain/application/use-case'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

export abstract class BaseDeleteCommentController {
  constructor (
    protected readonly deleteCommentUseCase: UseCase,
    protected readonly jwtService: JwtService
  ) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @Headers('authorization') authorization: string,
    @Param('commentId') commentId: string
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      await this.deleteCommentUseCase.execute({
        commentId,
        authorId,
      })
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
