import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateAnswerAttachmentUseCase } from '@/domain/application/usecases/update-answer-attachment/update-answer-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/presentation/pipes/schemas/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import {
  AttachmentParamsDto,
  attachmentParamsSchema,
  UpdateAttachmentBodyDto,
  updateAttachmentBodySchema,
} from '@/shared/presentation/protocols/attachment.protocol'

@ApiTags('Attachments')
@Controller('answer-attachments/:attachmentId')
export class UpdateAnswerAttachmentController {
  constructor (private readonly updateAnswerAttachmentUseCase: UpdateAnswerAttachmentUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update an answer attachment' })
  async handle (
    @Param(new ZodValidationPipe(attachmentParamsSchema)) params: AttachmentParamsDto,
    @Body(new ZodValidationPipe(updateAttachmentBodySchema)) body: UpdateAttachmentBodyDto
  ) {
    try {
      const { title, url } = body
      const attachment = await this.updateAnswerAttachmentUseCase.execute({
        attachmentId: params.attachmentId,
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
