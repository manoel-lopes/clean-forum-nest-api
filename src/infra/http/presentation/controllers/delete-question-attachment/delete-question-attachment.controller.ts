import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteQuestionAttachmentUseCase } from '@/domain/application/usecases/delete-question-attachment/delete-question-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/pipes/schemas/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { AttachmentParamsDto, attachmentParamsSchema } from '@/shared/presentation/protocols/attachment.protocol'

@ApiTags('Attachments')
@Controller('question-attachments/:attachmentId')
export class DeleteQuestionAttachmentController {
  constructor (private readonly deleteQuestionAttachmentUseCase: DeleteQuestionAttachmentUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a question attachment' })
  async handle (
    @Param(new ZodValidationPipe(attachmentParamsSchema)) params: AttachmentParamsDto
  ) {
    try {
      await this.deleteQuestionAttachmentUseCase.execute({
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
