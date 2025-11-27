import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { UpdateQuestionAttachmentUseCase } from '@/domain/application/usecases/update-question-attachment/update-question-attachment.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateQuestionAttachmentBody = {
  title: string
  url: string
}

@Controller('question-attachments/:attachmentId')
export class UpdateQuestionAttachmentController {
  constructor (private readonly updateQuestionAttachmentUseCase: UpdateQuestionAttachmentUseCase) {}

  @Put()
  async handle (
    @Param('attachmentId') attachmentId: string,
    @Body() body: UpdateQuestionAttachmentBody
  ) {
    try {
      const { title, url } = body
      const attachment = await this.updateQuestionAttachmentUseCase.execute({
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
