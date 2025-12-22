import type { User } from '@prisma/client'

export type UserWithoutPassword = Omit<User, 'password'>

export class PrismaUserMapper {
  static toDomain (raw: User): UserWithoutPassword {
    const { password: _, ...userWithoutPassword } = raw
    return userWithoutPassword
  }
}
