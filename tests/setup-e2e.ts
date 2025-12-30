import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { Answer } from '@/domain/enterprise/entities/answer.entity'
import { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { Comment } from '@/domain/enterprise/entities/comment.entity'
import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { Question } from '@/domain/enterprise/entities/question.entity'
import { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { User } from '@/domain/enterprise/entities/user.entity'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

process.on('unhandledRejection', (err) => {
  if (err instanceof Error && err.message === 'Connection is closed.') {
    return
  }
  throw err
})

function buildDatabaseUrl (schema: string): string {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${schema}`
}

function createDataSource (schema: string): DataSource {
  return new DataSource({
    type: 'postgres',
    url: buildDatabaseUrl(schema),
    schema,
    entities: [
      User,
      Question,
      Answer,
      Comment,
      Attachment,
      QuestionAttachment,
      AnswerAttachment,
      RefreshToken,
      EmailValidation,
    ],
    synchronize: true,
    logging: false,
  })
}

let schemaId: string
let dataSource: DataSource
let baseDataSource: DataSource

beforeAll(async () => {
  schemaId = randomUUID()
  process.env.DB_SCHEMA = schemaId

  baseDataSource = new DataSource({
    type: 'postgres',
    url: buildDatabaseUrl('public'),
    logging: false,
  })

  await baseDataSource.initialize()
  await baseDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
  await baseDataSource.destroy()

  dataSource = createDataSource(schemaId)
  await dataSource.initialize()
})

afterAll(async () => {
  if (dataSource?.isInitialized) {
    await dataSource.destroy()
  }

  baseDataSource = new DataSource({
    type: 'postgres',
    url: buildDatabaseUrl('public'),
    logging: false,
  })

  await baseDataSource.initialize()
  await baseDataSource.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await baseDataSource.destroy()
})
