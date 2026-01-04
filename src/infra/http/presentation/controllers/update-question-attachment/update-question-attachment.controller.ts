import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateQuestionAttachmentUseCase } from '@/domain/application/usecases/update-question-attachment/update-question-attachment.usecase'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import {
  AttachmentParamsDto,
  attachmentParamsSchema,
  UpdateAttachmentBodyDto,
  updateAttachmentBodySchema,
} from '@/shared/presentation/protocols/attachment.protocol'

@ApiTags('Attachments')
@Controller('question-attachments/:attachmentId')
export class UpdateQuestionAttachmentController {
  constructor (private readonly updateQuestionAttachmentUseCase: UpdateQuestionAttachmentUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update a question attachment' })
  async handle (
    @Param(new ZodValidationPipe(attachmentParamsSchema)) params: AttachmentParamsDto,
    @Body(new ZodValidationPipe(updateAttachmentBodySchema)) body: UpdateAttachmentBodyDto
  ) {
    const { attachmentId } = params
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
