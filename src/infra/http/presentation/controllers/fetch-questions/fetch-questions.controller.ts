import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  type FetchQuestionsQuery,
  fetchQuestionsQuerySchema,
} from './ports/fetch-questions.protocol'

@ApiTags('Questions')
@Controller('questions')
export class FetchQuestionsController {
  constructor (@Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Fetch questions with pagination' })
  @ApiOkResponse({ description: 'Questions fetched successfully' })
  @ApiInternalServerErrorResponse()
  async handle (@Query(new ZodValidationPipe(fetchQuestionsQuerySchema)) query: FetchQuestionsQuery) {
    const { page, pageSize, order, include } = query
    const questions = await this.questionsRepository.findMany({
      page,
      pageSize,
      order,
      include,
    })
    return questions
  }
}
