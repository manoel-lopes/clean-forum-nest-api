import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateAnswerAttachmentUseCase } from '@/domain/application/usecases/update-answer-attachment/update-answer-attachment.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  UpdateAnswerAttachmentBodyDto,
  updateAnswerAttachmentBodySchema,
  UpdateAnswerAttachmentParamsDto,
  updateAnswerAttachmentParamsSchema,
} from '@/infra/validation/schemas/presentation/attachments/update-answer-attachment.schema'
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('answer-attachments/:attachmentId')
export class UpdateAnswerAttachmentController {
  constructor (private readonly updateAnswerAttachmentUseCase: UpdateAnswerAttachmentUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update an answer attachment' })
  @ApiOkResponse('Attachment updated successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Attachment not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
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
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
