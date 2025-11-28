import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AttachToQuestionUseCase } from '@/domain/application/usecases/attach-to-question/attach-to-question.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type AttachToQuestionBody,
  attachToQuestionBodySchema,
  type AttachToQuestionParams,
  attachToQuestionParamsSchema,
} from '@/infra/validation/schemas/presentation/attachments/attach-to-question.schema'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Attachments')
@Controller('questions/:questionId/attachments')
export class AttachToQuestionController {
  constructor (private readonly attachToQuestionUseCase: AttachToQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Param(new ZodValidationPipe(attachToQuestionParamsSchema)) params: AttachToQuestionParams,
    @Body(new ZodValidationPipe(attachToQuestionBodySchema)) body: AttachToQuestionBody
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
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
