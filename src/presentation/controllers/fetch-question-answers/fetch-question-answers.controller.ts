import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import type { AnswerIncludeOption } from '@/domain/application/repositories/answers.repository'
import { FetchQuestionAnswersUseCase } from '@/domain/application/usecases/fetch-question-answers/fetch-question-answers.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type FetchQuestionAnswersQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
  include?: string
}

@Controller('questions/:questionId/answers')
export class FetchQuestionAnswersController {
  constructor (private readonly fetchQuestionAnswersUseCase: FetchQuestionAnswersUseCase) {}

  @Get()
  async handle (
    @Param('questionId') questionId: string,
    @Query() query: FetchQuestionAnswersQuery
  ) {
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
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
