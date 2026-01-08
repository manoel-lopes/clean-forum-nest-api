import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteAnswerAttachmentUseCase } from '@/domain/application/usecases/delete-answer-attachment/delete-answer-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/presentation/pipes/schemas/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { AttachmentParamsDto, attachmentParamsSchema } from '@/shared/presentation/protocols/attachment.protocol'

@ApiTags('Attachments')
@Controller('answer-attachments/:attachmentId')
export class DeleteAnswerAttachmentController {
  constructor (private readonly deleteAnswerAttachmentUseCase: DeleteAnswerAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an answer attachment' })
  async handle (
    @Param(new ZodValidationPipe(attachmentParamsSchema)) params: AttachmentParamsDto
  ) {
    try {
      await this.deleteAnswerAttachmentUseCase.execute({
        attachmentId: params.attachmentId,
      })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
