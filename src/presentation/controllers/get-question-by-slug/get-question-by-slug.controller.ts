import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { AnswerIncludeOption } from '@/domain/application/repositories/answers.repository'
import type { QuestionIncludeOption } from '@/domain/application/repositories/questions.repository'
import { GetQuestionBySlugUseCase } from '@/domain/application/usecases/get-question-by-slug/get-question-by-slug.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type GetQuestionBySlugParams,
  getQuestionBySlugParamsSchema,
  type GetQuestionBySlugQuery,
  getQuestionBySlugQuerySchema,
} from '@/infra/validation/schemas/presentation/questions/get-question-by-slug.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Questions')
@Public()
@Controller('questions/slug/:slug')
export class GetQuestionBySlugController {
  constructor (private readonly getQuestionBySlugUseCase: GetQuestionBySlugUseCase) {}

  @Get()
  async handle (
    @Param(new ZodValidationPipe(getQuestionBySlugParamsSchema)) params: GetQuestionBySlugParams,
    @Query(new ZodValidationPipe(getQuestionBySlugQuerySchema)) query: GetQuestionBySlugQuery
  ) {
    const { slug } = params
    try {
      const { page, pageSize, order, include, answerIncludes } = query
      let processedInclude: QuestionIncludeOption[] | undefined
      let processedAnswerIncludes: AnswerIncludeOption[] | undefined
      if (include) {
        const validQuestionOptions: QuestionIncludeOption[] = ['author', 'comments', 'attachments']
        const items = include.includes(',') ? include.split(',').map(item => item.trim()) : [include]
        const isValidQuestionOption = (item: string): item is QuestionIncludeOption => {
          return validQuestionOptions.some(option => option === item)
        }
        const filtered = items.filter(isValidQuestionOption)
        processedInclude = filtered.length > 0 ? filtered : undefined
      }
      if (answerIncludes) {
        const validAnswerOptions: AnswerIncludeOption[] = ['author', 'comments', 'attachments']
        const items = answerIncludes.includes(',')
          ? answerIncludes.split(',').map(item => item.trim())
          : [answerIncludes]
        const isValidAnswerOption = (item: string): item is AnswerIncludeOption => {
          return validAnswerOptions.some(option => option === item)
        }
        const filtered = items.filter(isValidAnswerOption)
        processedAnswerIncludes = filtered.length > 0 ? filtered : undefined
      }
      const question = await this.getQuestionBySlugUseCase.execute({
        slug,
        page,
        pageSize,
        order,
        include: processedInclude,
        answerIncludes: processedAnswerIncludes,
      })
      return question
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
