import type { users } from '@/infra/persistence/drizzle/schema'
import type { User } from '@/domain/enterprise/entities/user.entity'

type DrizzleUser = typeof users.$inferSelect

export class DrizzleUserMapper {
  static toDomain (raw: DrizzleUser): User {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  static toAuthor (raw: DrizzleUser): Omit<User, 'password'> {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
