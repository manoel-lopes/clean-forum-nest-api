import type { User as DomainUser } from '@/domain/enterprise/entities/user.entity'
import type { User as PrismaUser } from '@prisma/client'

export class PrismaUserMapper {
  static toDomain (raw: PrismaUser): Omit<DomainUser, 'password'> {
    const { password: _, ...userWithoutPassword } = raw
    return {
      ...userWithoutPassword,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
  }

  static toDomainWithPassword (raw: PrismaUser): DomainUser {
    return {
      ...raw,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
  }
}
