import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteQuestionAttachmentUseCase } from '@/domain/application/usecases/delete-question-attachment/delete-question-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  DeleteQuestionAttachmentParamsDto,
  deleteQuestionAttachmentParamsSchema,
} from './ports/delete-question-attachment.protocol'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('question-attachments/:attachmentId')
export class DeleteQuestionAttachmentController {
  constructor (private readonly deleteQuestionAttachmentUseCase: DeleteQuestionAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a question attachment' })
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
