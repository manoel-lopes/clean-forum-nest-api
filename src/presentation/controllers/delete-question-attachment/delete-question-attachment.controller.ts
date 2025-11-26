import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeleteQuestionAttachmentUseCase } from '@/domain/application/usecases/delete-question-attachment/delete-question-attachment.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('question-attachments/:attachmentId')
export class DeleteQuestionAttachmentController {
  constructor (private readonly deleteQuestionAttachmentUseCase: DeleteQuestionAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle (@Param('attachmentId') attachmentId: string) {
    try {
      await this.deleteQuestionAttachmentUseCase.execute({
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
