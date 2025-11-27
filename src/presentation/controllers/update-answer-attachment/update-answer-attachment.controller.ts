import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { UpdateAnswerAttachmentUseCase } from '@/domain/application/usecases/update-answer-attachment/update-answer-attachment.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateAnswerAttachmentBody = {
  title: string
  url: string
}

@Controller('answer-attachments/:attachmentId')
export class UpdateAnswerAttachmentController {
  constructor (private readonly updateAnswerAttachmentUseCase: UpdateAnswerAttachmentUseCase) {}

  @Put()
  async handle (
    @Param('attachmentId') attachmentId: string,
    @Body() body: UpdateAnswerAttachmentBody
  ) {
    try {
      const { title, url } = body
      const attachment = await this.updateAnswerAttachmentUseCase.execute({
        attachmentId,
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
