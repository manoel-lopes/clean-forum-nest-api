import {
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common'
import { type QuestionIncludeOption, QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { Public } from '@/infra/auth/decorators/public.decorator'

type FetchQuestionsQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
  include?: QuestionIncludeOption[]
}

@Controller('questions')
export class FetchQuestionsController {
  constructor (@Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository) {}

  @Public()
  @Get()
  async handle (@Query() query: FetchQuestionsQuery) {
    const { page, pageSize, order, include = [] } = query
    const questions = await this.questionsRepository.findMany({
      page,
      pageSize,
      order,
      include,
    })
    return questions
  }
}
