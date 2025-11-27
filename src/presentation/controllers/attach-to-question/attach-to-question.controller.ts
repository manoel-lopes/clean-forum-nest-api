import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { AttachToQuestionUseCase } from '@/domain/application/usecases/attach-to-question/attach-to-question.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToQuestionBody = {
  title: string
  url: string
}

@Controller('questions/:questionId/attachments')
export class AttachToQuestionController {
  constructor (private readonly attachToQuestionUseCase: AttachToQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Param('questionId') questionId: string,
    @Body() body: AttachToQuestionBody
  ) {
    try {
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
