import type { User as PrismaUser } from '@prisma/client'
import type { User as DomainUser } from '@/domain/enterprise/entities/user.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaUserMapper {
  static toDomain (raw: PrismaUser): Omit<DomainUser, 'password'> {
    const { password: _, ...userWithoutPassword } = raw
    return {
      ...userWithoutPassword,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }

  static toDomainWithPassword (raw: PrismaUser): DomainUser {
    return {
      ...raw,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }
}
