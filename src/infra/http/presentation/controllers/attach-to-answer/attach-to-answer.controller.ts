import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AttachToAnswerUseCase } from '@/domain/application/usecases/attach-to-answer/attach-to-answer.usecase'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  AttachToAnswerBodyDto,
  attachToAnswerBodySchema,
  AttachToAnswerParamsDto,
  attachToAnswerParamsSchema,
} from './ports/attach-to-answer.protocol'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('answers/:answerId/attachments')
export class AttachToAnswerController {
  constructor (private readonly attachToAnswerUseCase: AttachToAnswerUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Attach file to an answer' })
  @ApiCreatedResponse('Attachment created successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse('Answer not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @Param(new ZodValidationPipe(attachToAnswerParamsSchema)) params: AttachToAnswerParamsDto,
    @Body(new ZodValidationPipe(attachToAnswerBodySchema)) body: AttachToAnswerBodyDto
  ) {
    const { answerId } = params
    try {
      const { title, url } = body
      const attachment = await this.attachToAnswerUseCase.execute({
        answerId,
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
