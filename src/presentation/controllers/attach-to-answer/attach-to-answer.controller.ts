import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { AttachToAnswerUseCase } from '@/domain/application/usecases/attach-to-answer/attach-to-answer.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AttachToAnswerBody = {
  title: string
  url: string
}

@Controller('answers/:answerId/attachments')
export class AttachToAnswerController {
  constructor (private readonly attachToAnswerUseCase: AttachToAnswerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Param('answerId') answerId: string,
    @Body() body: AttachToAnswerBody
  ) {
    try {
      const { title, url } = body
      const attachment = await this.attachToAnswerUseCase.execute({
        answerId,
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
