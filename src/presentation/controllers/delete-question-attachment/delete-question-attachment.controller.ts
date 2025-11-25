import {
  Controller,
  Delete,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DeleteQuestionAttachmentUseCase } from '@/domain/application/usecases/delete-question-attachment/delete-question-attachment.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('question-attachments/:attachmentId')
export class DeleteQuestionAttachmentController {
  constructor (private readonly deleteQuestionAttachmentUseCase: DeleteQuestionAttachmentUseCase,
    private readonly jwtService: JwtService) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @Headers('authorization') authorization: string, @Param('attachmentId') attachmentId: string) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      this.jwtService.verify(token)
      await this.deleteQuestionAttachmentUseCase.execute({
        attachmentId,
      })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
