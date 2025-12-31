import type { User as PrismaUser } from '@prisma/client'
import type { User } from '@/domain/enterprise/entities/user.entity'

export class PrismaUserMapper {
  static toDomain (raw: PrismaUser): Omit<User, 'password'> {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
