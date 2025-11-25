import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import type { AnswerIncludeOption } from '@/domain/application/repositories/answers.repository'
import type { QuestionIncludeOption } from '@/domain/application/repositories/questions.repository'
import { GetQuestionBySlugUseCase } from '@/domain/application/usecases/get-question-by-slug/get-question-by-slug.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type GetQuestionBySlugQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
  include?: string
  answerIncludes?: string
}

@Controller('questions/slug/:slug')
export class GetQuestionBySlugController {
  constructor (private readonly getQuestionBySlugUseCase: GetQuestionBySlugUseCase) {}

  @Get()
  async handle (
    @Param('slug') slug: string,
    @Query() query: GetQuestionBySlugQuery
  ) {
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
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
