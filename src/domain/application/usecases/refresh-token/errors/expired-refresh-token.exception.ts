export class ExpiredRefreshTokenException extends Error {
  constructor () {
    super('The refresh token has expired')
  }
}
