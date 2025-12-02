import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AttachToAnswerUseCase } from '@/domain/application/usecases/attach-to-answer/attach-to-answer.usecase'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type AttachToAnswerBody,
  attachToAnswerBodySchema,
  type AttachToAnswerParams,
  attachToAnswerParamsSchema,
} from '@/infra/validation/schemas/presentation/attachments/attach-to-answer.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Attachments')
@Controller('answers/:answerId/attachments')
export class AttachToAnswerController {
  constructor (private readonly attachToAnswerUseCase: AttachToAnswerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @Param(new ZodValidationPipe(attachToAnswerParamsSchema)) params: AttachToAnswerParams,
    @Body(new ZodValidationPipe(attachToAnswerBodySchema)) body: AttachToAnswerBody
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
