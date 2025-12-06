import { Controller, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateCommentUseCase } from '@/domain/application/usecases/update-comment/update-comment.usecase'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { BaseUpdateCommentController } from '../base/base-update-comment.controller'

@ApiTags('Comments')
@Controller('questions/comments/:commentId')
export class UpdateQuestionCommentController extends BaseUpdateCommentController {
  constructor (updateCommentUseCase: UpdateCommentUseCase) {
    super(updateCommentUseCase)
  }

  @Put()
  @ApiOperation({ summary: 'Update a question comment' })
  @ApiOkResponse('Comment updated successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Comment not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  override handle (...args: Parameters<BaseUpdateCommentController['handle']>) {
    return super.handle(...args)
  }
}
