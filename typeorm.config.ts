import 'reflect-metadata'
import { DataSource, DataSourceOptions } from 'typeorm'
import { entities } from './src/domain/enterprise/entities'

function getDatabaseUrl (): string {
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl?.startsWith('postgresql://')) {
    return databaseUrl
  }
  const dbUser = process.env.DB_USER
  const dbPassword = process.env.DB_PASSWORD
  const dbHost = process.env.DB_HOST
  const dbPort = process.env.DB_PORT
  const dbName = process.env.DB_NAME
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: getDatabaseUrl(),
  entities,
  migrations: ['./migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}

export default new DataSource(dataSourceOptions)
