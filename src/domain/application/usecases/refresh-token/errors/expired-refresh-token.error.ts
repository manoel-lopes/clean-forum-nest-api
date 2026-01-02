export class ExpiredRefreshTokenError extends Error {
  constructor () {
    super('The refresh token has expired')
  }
}
