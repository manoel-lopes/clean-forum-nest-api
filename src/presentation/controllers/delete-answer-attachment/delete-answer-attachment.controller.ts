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
import { DeleteAnswerAttachmentUseCase } from '@/domain/application/usecases/delete-answer-attachment/delete-answer-attachment.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('answer-attachments/:attachmentId')
export class DeleteAnswerAttachmentController {
  constructor (private readonly deleteAnswerAttachmentUseCase: DeleteAnswerAttachmentUseCase,
    private readonly jwtService: JwtService) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @Headers('authorization') authorization: string,
    @Param('attachmentId') attachmentId: string) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      this.jwtService.verify(token)
      await this.deleteAnswerAttachmentUseCase.execute({
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
