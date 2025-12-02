export class UserWithEmailAlreadyRegisteredException extends Error {
  constructor () {
    super('User with email already registered')
  }
}
