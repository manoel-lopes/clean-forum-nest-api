import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateAnswerAttachmentUseCase } from '@/domain/application/usecases/update-answer-attachment/update-answer-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  UpdateAnswerAttachmentBodyDto,
  updateAnswerAttachmentBodySchema,
  UpdateAnswerAttachmentParamsDto,
  updateAnswerAttachmentParamsSchema,
} from '@/infra/http/ports/attachments/update-answer-attachment.schema'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Attachments')
@Controller('answer-attachments/:attachmentId')
export class UpdateAnswerAttachmentController {
  constructor (private readonly updateAnswerAttachmentUseCase: UpdateAnswerAttachmentUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update an answer attachment' })
  async handle (
    @Param(new ZodValidationPipe(updateAnswerAttachmentParamsSchema)) params: UpdateAnswerAttachmentParamsDto,
    @Body(new ZodValidationPipe(updateAnswerAttachmentBodySchema)) body: UpdateAnswerAttachmentBodyDto
  ) {
    const { attachmentId } = params
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
