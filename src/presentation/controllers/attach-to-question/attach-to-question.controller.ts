import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AttachToQuestionUseCase } from '@/domain/application/usecases/attach-to-question/attach-to-question.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  AttachToQuestionBodyDto,
  attachToQuestionBodySchema,
  AttachToQuestionParamsDto,
  attachToQuestionParamsSchema,
} from '@/infra/validation/schemas/presentation/attachments/attach-to-question.schema'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('questions/:questionId/attachments')
export class AttachToQuestionController {
  constructor (private readonly attachToQuestionUseCase: AttachToQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Attach a file to a question' })
  @ApiCreatedResponse('Attachment created successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Question not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @Param(new ZodValidationPipe(attachToQuestionParamsSchema)) params: AttachToQuestionParamsDto,
    @Body(new ZodValidationPipe(attachToQuestionBodySchema)) body: AttachToQuestionBodyDto
  ) {
    const { questionId } = params
    try {
      const { title, url } = body
      const attachment = await this.attachToQuestionUseCase.execute({
        questionId,
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
