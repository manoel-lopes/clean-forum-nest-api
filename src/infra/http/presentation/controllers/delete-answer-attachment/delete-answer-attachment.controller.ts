import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteAnswerAttachmentUseCase } from '@/domain/application/usecases/delete-answer-attachment/delete-answer-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  DeleteAnswerAttachmentParamsDto,
  deleteAnswerAttachmentParamsSchema,
} from './ports/delete-answer-attachment.protocol'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('answer-attachments/:attachmentId')
export class DeleteAnswerAttachmentController {
  constructor (private readonly deleteAnswerAttachmentUseCase: DeleteAnswerAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an answer attachment' })
  async handle (
    @Param(new ZodValidationPipe(deleteAnswerAttachmentParamsSchema)) params: DeleteAnswerAttachmentParamsDto
  ) {
    const { attachmentId } = params
    try {
      await this.deleteAnswerAttachmentUseCase.execute({
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
