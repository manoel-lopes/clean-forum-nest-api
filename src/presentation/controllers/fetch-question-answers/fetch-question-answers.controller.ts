import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { AnswerIncludeOption } from '@/domain/application/repositories/answers.repository'
import { FetchQuestionAnswersUseCase } from '@/domain/application/usecases/fetch-question-answers/fetch-question-answers.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type FetchQuestionAnswersParams,
  fetchQuestionAnswersParamsSchema,
  type FetchQuestionAnswersQuery,
  fetchQuestionAnswersQuerySchema,
} from '@/infra/validation/schemas/presentation/answers/fetch-question-answers.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Answers')
@Public()
@Controller('questions/:questionId/answers')
export class FetchQuestionAnswersController {
  constructor (private readonly fetchQuestionAnswersUseCase: FetchQuestionAnswersUseCase) {}

  @Get()
  async handle (
    @Param(new ZodValidationPipe(fetchQuestionAnswersParamsSchema)) params: FetchQuestionAnswersParams,
    @Query(new ZodValidationPipe(fetchQuestionAnswersQuerySchema)) query: FetchQuestionAnswersQuery
  ) {
    const { questionId } = params
    try {
      const { page = 1, pageSize = 20, order = 'desc', include } = query
      let processedInclude: AnswerIncludeOption[] | undefined
      if (include) {
        const validOptions: AnswerIncludeOption[] = ['author', 'comments', 'attachments']
        const items = include.includes(',') ? include.split(',').map(item => item.trim()) : [include]
        const isValidOption = (item: string): item is AnswerIncludeOption => {
          return validOptions.some(option => option === item)
        }
        const filtered = items.filter(isValidOption)
        processedInclude = filtered.length > 0 ? filtered : undefined
      }
      const answers = await this.fetchQuestionAnswersUseCase.execute({
        questionId,
        page,
        pageSize,
        order,
        include: processedInclude,
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
