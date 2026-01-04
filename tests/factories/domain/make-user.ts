import { User, UserProps } from '@/domain/enterprise/entities/user/user.entity'
import { faker } from '@faker-js/faker'

export function makeUser (override: Partial<User> = {}): User {
  const props: UserProps = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...override,
  }
  return User.create(props)
}
