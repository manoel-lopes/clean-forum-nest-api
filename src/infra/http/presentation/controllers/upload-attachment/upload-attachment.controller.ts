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
import { FileInterceptor, UploadedFileData } from '@/infra/http/interceptors/fastify-file.interceptor'
import { FileTypeValidator } from '@/infra/http/pipes/file/file-type-validator.pipe'
import { MaxFileSizeValidator } from '@/infra/http/pipes/file/max-file-size-validator.pipe'
import { ParseFilePipe } from '@/infra/http/pipes/file/parse-file.pipe'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { UploadedFile } from '@/infra/http/presentation/decorators/uploaded-file.decorator'
import { UploadAttachmentBodyDto } from './ports/upload-attachment.protocol'

@ApiTags('Attachments')
@Controller('attachments')
export class UploadAttachmentController {
  constructor (private readonly uploadAttachmentUseCase: UploadAttachmentUseCase) {}

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
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
