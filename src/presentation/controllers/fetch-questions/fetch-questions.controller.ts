import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { type QuestionIncludeOption, QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type FetchQuestionsQuery,
  fetchQuestionsQuerySchema,
} from '@/infra/validation/schemas/presentation/questions/fetch-questions.schema'
import { ApiOkResponse } from '@/presentation/decorators/api-responses.decorator'

@ApiTags('Questions')
@Controller('questions')
export class FetchQuestionsController {
  constructor (@Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Fetch questions with pagination' })
  @ApiOkResponse('Questions fetched successfully')
  async handle (@Query(new ZodValidationPipe(fetchQuestionsQuerySchema)) query: FetchQuestionsQuery) {
    const { page, pageSize, order, include } = query
    let processedInclude: QuestionIncludeOption[] = []
    if (include) {
      const validOptions: QuestionIncludeOption[] = ['author', 'comments', 'attachments']
      const items = include.includes(',') ? include.split(',').map(item => item.trim()) : [include]
      const isValidOption = (item: string): item is QuestionIncludeOption => {
        return validOptions.some(option => option === item)
      }
      processedInclude = items.filter(isValidOption)
    }
    const questions = await this.questionsRepository.findMany({
      page,
      pageSize,
      order,
      include: processedInclude,
    })
    return questions
  }
}
