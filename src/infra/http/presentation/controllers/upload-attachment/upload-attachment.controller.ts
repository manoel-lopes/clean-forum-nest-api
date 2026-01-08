import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { InvalidAttachmentTypeError } from '@/domain/application/usecases/upload-attachment/errors/invalid-attachment-type.error'
import { UploadAttachmentUseCase } from '@/domain/application/usecases/upload-attachment/upload-attachment.usecase'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { UploadedFile } from '@/infra/http/presentation/decorators/uploaded-file.decorator'
import { FastifyFileInterceptor, UploadedFileData } from '@/infra/http/presentation/interceptors/fastify-file.interceptor'
import { ParseFilePipe } from '@/infra/http/presentation/pipes/files/parse-file.pipe'
import { FileTypeValidator } from '@/infra/validation/files/file-type-validator'
import { MaxFileSizeValidator } from '@/infra/validation/files/max-file-size-validator'
import { UploadAttachmentBodyDto } from './ports/upload-attachment.protocol'

@ApiTags('Attachments')
@Controller('attachments')
export class UploadAttachmentController {
  constructor (private readonly uploadAttachmentUseCase: UploadAttachmentUseCase) {}

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(new FastifyFileInterceptor())
  @ApiOperation({ summary: 'Upload a file attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAttachmentBodyDto })
  @ApiCreatedResponse('File uploaded successfully')
  @ApiUnauthorizedResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator(),
        new FileTypeValidator(),
      ],
    }))
    file: UploadedFileData
  ) {
    try {
      return await this.uploadAttachmentUseCase.execute({
        fileName: file.filename,
        fileType: file.mimetype,
        body: file.buffer,
      })
    } catch (error) {
      if (error instanceof InvalidAttachmentTypeError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
