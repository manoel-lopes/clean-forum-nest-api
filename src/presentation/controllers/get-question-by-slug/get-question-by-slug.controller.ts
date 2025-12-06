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
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  GetQuestionBySlugParamsDto,
  getQuestionBySlugParamsSchema,
  GetQuestionBySlugQueryDto,
  getQuestionBySlugQuerySchema,
} from '@/infra/validation/schemas/presentation/questions/get-question-by-slug.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
