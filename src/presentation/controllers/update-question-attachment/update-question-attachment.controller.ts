import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateQuestionAttachmentUseCase } from '@/domain/application/usecases/update-question-attachment/update-question-attachment.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  UpdateQuestionAttachmentBodyDto,
  updateQuestionAttachmentBodySchema,
  UpdateQuestionAttachmentParamsDto,
  updateQuestionAttachmentParamsSchema,
} from '@/infra/validation/schemas/presentation/attachments/update-question-attachment.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('question-attachments/:attachmentId')
export class UpdateQuestionAttachmentController {
  constructor (private readonly updateQuestionAttachmentUseCase: UpdateQuestionAttachmentUseCase) {}

  @Put()
  async handle (
    @Param(new ZodValidationPipe(updateQuestionAttachmentParamsSchema)) params: UpdateQuestionAttachmentParamsDto,
    @Body(new ZodValidationPipe(updateQuestionAttachmentBodySchema)) body: UpdateQuestionAttachmentBodyDto
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
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
