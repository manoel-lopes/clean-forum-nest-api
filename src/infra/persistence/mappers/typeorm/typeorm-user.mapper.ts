import { User } from '@/domain/enterprise/entities/user.entity'

export class TypeOrmUserMapper {
  static toDomain (raw: User): User {
    return User.create({
      name: raw.name,
      email: raw.email,
      password: raw.password,
    }, raw.id)
  }
}
