export type LogLevel = 'silent' | 'info' | 'error'

export type Environment = 'test' | 'development' | 'production'

export type LogLevelConfig = {
  [K in Environment]: LogLevel
}
