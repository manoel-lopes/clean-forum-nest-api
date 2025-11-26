import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { FetchUserQuestionsUseCase } from '@/domain/application/usecases/fetch-user-questions/fetch-user-questions.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'

type FetchUserQuestionsQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
}

@Public()
@Controller('users/:userId/questions')
export class FetchUserQuestionsController {
  constructor (private readonly fetchUserQuestionsUseCase: FetchUserQuestionsUseCase) {}

  @Get()
  async handle (
    @Param('userId') userId: string,
    @Query() query: FetchUserQuestionsQuery
  ) {
    const { page, pageSize, order } = query
    const questions = await this.fetchUserQuestionsUseCase.execute({
      userId,
      page,
      pageSize,
      order,
    })
    return questions
  }
}
