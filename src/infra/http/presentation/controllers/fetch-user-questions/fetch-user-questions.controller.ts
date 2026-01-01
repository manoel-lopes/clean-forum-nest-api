import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { FetchUserQuestionsUseCase } from '@/domain/application/usecases/fetch-user-questions/fetch-user-questions.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  type FetchUserQuestionsParams,
  fetchUserQuestionsParamsSchema,
  type FetchUserQuestionsQuery,
  fetchUserQuestionsQuerySchema,
} from './ports/fetch-user-questions.protocol'

@ApiTags('Users')
@Public()
@Controller('users/:userId/questions')
export class FetchUserQuestionsController {
  constructor (private readonly fetchUserQuestionsUseCase: FetchUserQuestionsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Fetch questions by user' })
  async handle (
    @Param(new ZodValidationPipe(fetchUserQuestionsParamsSchema)) params: FetchUserQuestionsParams,
    @Query(new ZodValidationPipe(fetchUserQuestionsQuerySchema)) query: FetchUserQuestionsQuery
  ) {
    const { userId } = params
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
