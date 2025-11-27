import { faker } from '@faker-js/faker'

export interface UserTestData {
  id?: string
  name?: unknown
  email?: unknown
  password?: unknown
}

export class UserBuilder {
  private userData: UserTestData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'P@ssword123',
  }

  withName (name: unknown = faker.person.fullName()): UserBuilder {
    this.userData.name = name
    return this
  }

  withEmail (email: unknown = faker.internet.email()): UserBuilder {
    this.userData.email = email
    return this
  }

  withPassword (password: unknown = 'P@ssword123'): UserBuilder {
    this.userData.password = password
    return this
  }

  build (): UserTestData {
    return { ...this.userData }
  }
}

export const aUser = (): UserBuilder => new UserBuilder()
