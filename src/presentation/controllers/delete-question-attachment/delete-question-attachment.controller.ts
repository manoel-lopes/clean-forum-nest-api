import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DeleteQuestionAttachmentUseCase } from '@/domain/application/usecases/delete-question-attachment/delete-question-attachment.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  DeleteQuestionAttachmentParamsDto,
  deleteQuestionAttachmentParamsSchema,
} from '@/infra/validation/schemas/presentation/attachments/delete-question-attachment.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('question-attachments/:attachmentId')
export class DeleteQuestionAttachmentController {
  constructor (private readonly deleteQuestionAttachmentUseCase: DeleteQuestionAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @Param(new ZodValidationPipe(deleteQuestionAttachmentParamsSchema)) params: DeleteQuestionAttachmentParamsDto
  ) {
    const { attachmentId } = params
    try {
      await this.deleteQuestionAttachmentUseCase.execute({
        attachmentId,
      })
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
