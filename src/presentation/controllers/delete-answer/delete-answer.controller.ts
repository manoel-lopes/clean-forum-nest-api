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
import { DeleteAnswerUseCase } from '@/domain/application/usecases/delete-answer/delete-answer.usecase'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('answers/:answerId')
export class DeleteAnswerController {
  constructor (private readonly deleteAnswerUseCase: DeleteAnswerUseCase,
    private readonly jwtService: JwtService) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @Headers('authorization') authorization: string,
    @Param('answerId') answerId: string
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      await this.deleteAnswerUseCase.execute({
        answerId,
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
