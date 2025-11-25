import {
  Body,
  ConflictException,
  Controller,
  Headers,
  HttpCode,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CreateQuestionUseCase } from '@/domain/application/usecases/create-question/create-question.usecase'
import { QuestionWithTitleAlreadyRegisteredError } from '@/domain/application/usecases/create-question/errors/question-with-title-already-registered.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CreateQuestionBody = {
  title: string
  content: string
  attachments?: Array<{ title: string, url: string }>
}

@Controller('questions')
export class CreateQuestionController {
  constructor (private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly jwtService: JwtService) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Headers('authorization') authorization: string,
    @Body() body: CreateQuestionBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const authorId = payload.sub
      const { title, content } = body
      const question = await this.createQuestionUseCase.execute({ title, content, authorId })
      return question
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof QuestionWithTitleAlreadyRegisteredError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
