import type { FastifyRequest } from 'fastify'
import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  Req,
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

@ApiTags('Attachments')
@Controller('attachments')
export class UploadAttachmentController {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  constructor (private readonly uploadAttachmentUseCase: UploadAttachmentUseCase) {}

  @Post('upload')
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload a file attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse('File uploaded successfully')
  @ApiUnauthorizedResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (@Req() request: FastifyRequest) {
    const file = await request.file()
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }
    const buffer = await file.toBuffer()
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 5MB limit')
    }
    try {
      const response = await this.uploadAttachmentUseCase.execute({
        fileName: file.filename,
        fileType: file.mimetype,
        body: buffer,
      })
      return response
    } catch (error) {
      if (error instanceof InvalidAttachmentTypeError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
