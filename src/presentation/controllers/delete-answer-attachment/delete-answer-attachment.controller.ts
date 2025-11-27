import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeleteAnswerAttachmentUseCase } from '@/domain/application/usecases/delete-answer-attachment/delete-answer-attachment.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('answer-attachments/:attachmentId')
export class DeleteAnswerAttachmentController {
  constructor (private readonly deleteAnswerAttachmentUseCase: DeleteAnswerAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle (@Param('attachmentId') attachmentId: string) {
    try {
      await this.deleteAnswerAttachmentUseCase.execute({
        attachmentId,
      })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
