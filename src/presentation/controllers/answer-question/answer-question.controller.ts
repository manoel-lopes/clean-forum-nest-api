import {
  Body,
  Controller,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AnswerQuestionUseCase } from '@/domain/application/usecases/answer-question/answer-question.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AnswerQuestionBody = {
  content: string
}

@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
  constructor (private readonly answerQuestionUseCase: AnswerQuestionUseCase,
    private readonly jwtService: JwtService) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Headers('authorization') authorization: string,
    @Param('questionId') questionId: string,
    @Body() body: AnswerQuestionBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      const { content } = body
      const answer = await this.answerQuestionUseCase.execute({
        authorId,
        questionId,
        content,
      })
      return answer
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
