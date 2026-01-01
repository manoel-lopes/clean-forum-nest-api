import type { FastifyRequest } from 'fastify'
import type { MultipartFile } from '@fastify/multipart'
import {
  BadRequestException,
  Controller,
  HttpCode,
  NotAcceptableException,
  Post,
  Req,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { InvalidAttachmentTypeException } from '@/domain/application/usecases/upload-attachment/exceptions/invalid-attachment-type.exception'
import { UploadAttachmentUseCase } from '@/domain/application/usecases/upload-attachment/upload-attachment.usecase'
import { isFastifyError } from '@/infra/http/helpers/is-fastify-error'
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { UploadAttachmentBodyDto } from './ports/upload-attachment.protocol'

@ApiTags('Attachments')
@Controller('attachments')
export class UploadAttachmentController {
  constructor (private readonly uploadAttachmentUseCase: UploadAttachmentUseCase) {}

  @Post('upload')
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload a file attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAttachmentBodyDto })
  @ApiCreatedResponse('File uploaded successfully')
  @ApiUnauthorizedResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (@Req() request: FastifyRequest) {
    const file = await this.parseMultipartFile(request)
    const buffer = await this.validateFileSize(file)
    try {
      return await this.uploadAttachmentUseCase.execute({
        fileName: file.filename,
        fileType: file.mimetype,
        body: buffer,
      })
    } catch (error) {
      if (error instanceof InvalidAttachmentTypeException) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }

  private async parseMultipartFile (request: FastifyRequest): Promise<MultipartFile> {
    try {
      const file = await request.file()
      if (!file) {
        throw new BadRequestException('No file uploaded')
      }
      return file
    } catch (error) {
      if (isFastifyError(error) && error.code === 'FST_INVALID_MULTIPART_CONTENT_TYPE') {
        throw new NotAcceptableException('Request is not multipart')
      }
      throw error
    }
  }

  private async validateFileSize (file: MultipartFile): Promise<Buffer> {
    const buffer = await file.toBuffer()
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 5MB limit')
    }
    return buffer
  }
}
