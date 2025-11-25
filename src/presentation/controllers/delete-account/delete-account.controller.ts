import {
  Controller,
  Delete,
  Headers,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DeleteAccountUseCase } from '@/domain/application/usecases/delete-account/delete-account.usecase'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { Prisma } from '@prisma/client'

@Controller('users')
export class DeleteAccountController {
  constructor (private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly jwtService: JwtService) {}

  @Delete()
  @HttpCode(204)
  async handle (@Headers('authorization') authorization: string) {
    try {
      const token = authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing authorization token')
      const payload = this.jwtService.verify(token)
      const userId = payload.sub
      await this.deleteAccountUseCase.execute({ userId })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found')
      }
      throw error
    }
  }
}
