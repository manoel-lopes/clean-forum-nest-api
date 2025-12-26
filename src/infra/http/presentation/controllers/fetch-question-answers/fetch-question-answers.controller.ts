import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { FetchQuestionAnswersUseCase } from '@/domain/application/usecases/fetch-question-answers/fetch-question-answers.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  FetchQuestionAnswersParamsDto,
  fetchQuestionAnswersParamsSchema,
  FetchQuestionAnswersQueryDto,
  fetchQuestionAnswersQuerySchema,
} from '@/infra/http/ports/answers/fetch-question-answers.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Answers')
@Public()
@Controller('questions/:questionId/answers')
export class FetchQuestionAnswersController {
  constructor (private readonly fetchQuestionAnswersUseCase: FetchQuestionAnswersUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Fetch answers for a question' })
  @ApiOkResponse({ description: 'Answers fetched successfully' })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @Param(new ZodValidationPipe(fetchQuestionAnswersParamsSchema)) params: FetchQuestionAnswersParamsDto,
    @Query(new ZodValidationPipe(fetchQuestionAnswersQuerySchema)) query: FetchQuestionAnswersQueryDto
  ) {
    const { questionId } = params
    const { page, pageSize, order, include } = query
    try {
      const answers = await this.fetchQuestionAnswersUseCase.execute({
        questionId,
        page,
        pageSize,
        order,
        include,
      })
      return answers
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
