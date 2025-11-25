import {
  Controller,
  Delete,
  ForbiddenException,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DeleteQuestionUseCase } from '@/domain/application/usecases/delete-question/delete-question.usecase'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('questions/:questionId')
export class DeleteQuestionController {
  constructor (private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
    private readonly jwtService: JwtService) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @Headers('authorization') authorization: string,
    @Param('questionId') questionId: string
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      await this.deleteQuestionUseCase.execute({
        questionId,
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
