import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { Answer } from '@/domain/enterprise/entities/answer.entity'
import { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { Question } from '@/domain/enterprise/entities/question.entity'
import { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { User } from '@/domain/enterprise/entities/user.entity'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && reason.message === 'Connection is closed.') {
    return
  }
  throw reason
})

const entities = [
  User,
  Question,
  Answer,
  Comment,
  Attachment,
  RefreshToken,
  EmailValidation,
]

function generateUniqueDatabaseURL (schemaId: string) {
  const databaseURL = process.env.DATABASE_URL
  if (!databaseURL) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }
  const url = new URL(databaseURL)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

function createDataSource (connectionString: string, schema: string): DataSource {
  return new DataSource({
    type: 'postgres',
    url: connectionString,
    schema,
    entities,
    synchronize: true,
    logging: false,
  })
}

let schemaId: string
let dataSource: DataSource
let baseDataSource: DataSource

beforeAll(async () => {
  schemaId = randomUUID()
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  process.env.DATABASE_URL = databaseURL

  const baseDatabaseURL = process.env.DATABASE_URL?.replace(/\?schema=.*$/, '') || process.env.DATABASE_URL

  baseDataSource = new DataSource({
    type: 'postgres',
    url: baseDatabaseURL,
    logging: false,
  })

  await baseDataSource.initialize()
  await baseDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
  await baseDataSource.destroy()

  dataSource = createDataSource(databaseURL, schemaId)
  await dataSource.initialize()
})

afterAll(async () => {
  if (dataSource?.isInitialized) {
    await dataSource.destroy()
  }

  const baseDatabaseURL = process.env.DATABASE_URL?.replace(/\?schema=.*$/, '') || process.env.DATABASE_URL
  baseDataSource = new DataSource({
    type: 'postgres',
    url: baseDatabaseURL,
    logging: false,
  })

  await baseDataSource.initialize()
  await baseDataSource.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await baseDataSource.destroy()
})
