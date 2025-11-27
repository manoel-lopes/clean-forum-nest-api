import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FetchUserQuestionsUseCase } from '@/domain/application/usecases/fetch-user-questions/fetch-user-questions.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type FetchUserQuestionsParams,
  fetchUserQuestionsParamsSchema,
  type FetchUserQuestionsQuery,
  fetchUserQuestionsQuerySchema,
} from '@/infra/validation/schemas/presentation/questions/fetch-user-questions.schema'

@ApiTags('Users')
@Public()
@Controller('users/:userId/questions')
export class FetchUserQuestionsController {
  constructor (private readonly fetchUserQuestionsUseCase: FetchUserQuestionsUseCase) {}

  @Get()
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
