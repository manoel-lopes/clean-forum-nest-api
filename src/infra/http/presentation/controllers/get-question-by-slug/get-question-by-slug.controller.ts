import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { GetQuestionBySlugUseCase } from '@/domain/application/usecases/get-question-by-slug/get-question-by-slug.usecase'
import { Public } from '@/infra/auth/decorators/public.decorator'
import { ZodValidationPipe } from '@/infra/http/presentation/pipes/schemas/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import {
  GetQuestionBySlugParamsDto,
  getQuestionBySlugParamsSchema,
  GetQuestionBySlugQueryDto,
  getQuestionBySlugQuerySchema,
} from './ports/get-question-by-slug.protocol'

@ApiTags('Questions')
@Public()
@Controller('questions/slug/:slug')
export class GetQuestionBySlugController {
  constructor (private readonly getQuestionBySlugUseCase: GetQuestionBySlugUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get a question by slug' })
  @ApiOkResponse({ description: 'Question found' })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiInternalServerErrorResponse()
  async handle (
    @Param(new ZodValidationPipe(getQuestionBySlugParamsSchema)) params: GetQuestionBySlugParamsDto,
    @Query(new ZodValidationPipe(getQuestionBySlugQuerySchema)) query: GetQuestionBySlugQueryDto
  ) {
    const { slug } = params
    const { page, pageSize, order, include, answerIncludes } = query
    try {
      const question = await this.getQuestionBySlugUseCase.execute({
        slug,
        page,
        pageSize,
        order,
        include,
        answerIncludes,
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
