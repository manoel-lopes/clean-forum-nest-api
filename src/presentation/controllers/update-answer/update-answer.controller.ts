import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UpdateAnswerUseCase } from '@/domain/application/usecases/update-answer/update-answer.usecase'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAnswerBody = {
  content: string
}

@Controller('answers/:answerId')
export class UpdateAnswerController {
  constructor (private readonly updateAnswerUseCase: UpdateAnswerUseCase,
    private readonly jwtService: JwtService) {}

  @Put()
  async handle (
    @Headers('authorization') authorization: string,
    @Param('answerId') answerId: string,
    @Body() body: UpdateAnswerBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      const { content } = body
      const answer = await this.updateAnswerUseCase.execute({
        answerId,
        content,
        authorId,
      })
      return { answer }
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
