export function extractToken (authHeader?: string) {
  const [, token] = authHeader?.split(' ') ?? []
  return token
}
