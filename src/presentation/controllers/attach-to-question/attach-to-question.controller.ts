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
import { AttachToQuestionUseCase } from '@/domain/application/usecases/attach-to-question/attach-to-question.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToQuestionBody = {
  title: string
  url: string
}

@Controller('questions/:questionId/attachments')
export class AttachToQuestionController {
  constructor (private readonly attachToQuestionUseCase: AttachToQuestionUseCase,
    private readonly jwtService: JwtService) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Headers('authorization') authorization: string,
    @Param('questionId') questionId: string,
    @Body() body: AttachToQuestionBody
  ) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      this.jwtService.verify(token)
      const { title, url } = body
      const attachment = await this.attachToQuestionUseCase.execute({
        questionId,
        title,
        url,
      })
      return attachment
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
