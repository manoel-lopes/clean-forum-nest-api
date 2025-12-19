import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && reason.message === 'Connection is closed.') {
    return
  }
  throw reason
})

function generateUniqueDatabaseURL (schemaId: string) {
  const databaseURL = process.env.DATABASE_URL
  if (!databaseURL) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }
  const url = new URL(databaseURL)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

function generateCreateTablesSql (schemaId: string): string {
  return `
    CREATE TABLE "${schemaId}"."users" (
      "id" varchar(36) PRIMARY KEY,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "password" text NOT NULL,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE "${schemaId}"."questions" (
      "id" varchar(36) PRIMARY KEY,
      "title" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "content" text NOT NULL,
      "authorId" varchar(36) NOT NULL REFERENCES "${schemaId}"."users"("id"),
      "bestAnswerId" varchar(36),
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
    );
    CREATE INDEX "questions_authorId_idx" ON "${schemaId}"."questions"("authorId");
    CREATE INDEX "questions_createdAt_idx" ON "${schemaId}"."questions"("createdAt");
    CREATE UNIQUE INDEX "questions_slug_idx" ON "${schemaId}"."questions"("slug");

    CREATE TABLE "${schemaId}"."answers" (
      "id" varchar(36) PRIMARY KEY,
      "content" text NOT NULL,
      "authorId" varchar(36) NOT NULL REFERENCES "${schemaId}"."users"("id"),
      "questionId" varchar(36) NOT NULL REFERENCES "${schemaId}"."questions"("id") ON DELETE CASCADE,
      "excerpt" text NOT NULL,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
    );
    CREATE INDEX "answers_questionId_idx" ON "${schemaId}"."answers"("questionId");
    CREATE INDEX "answers_authorId_idx" ON "${schemaId}"."answers"("authorId");
    CREATE INDEX "answers_createdAt_idx" ON "${schemaId}"."answers"("createdAt");
    CREATE INDEX "answers_questionId_createdAt_idx" ON "${schemaId}"."answers"("questionId", "createdAt");

    CREATE TABLE "${schemaId}"."comments" (
      "id" varchar(36) PRIMARY KEY,
      "content" text NOT NULL,
      "authorId" varchar(36) NOT NULL REFERENCES "${schemaId}"."users"("id"),
      "questionId" varchar(36) REFERENCES "${schemaId}"."questions"("id") ON DELETE CASCADE,
      "answerId" varchar(36) REFERENCES "${schemaId}"."answers"("id") ON DELETE CASCADE,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone
    );
    CREATE INDEX "comments_questionId_idx" ON "${schemaId}"."comments"("questionId");
    CREATE INDEX "comments_answerId_idx" ON "${schemaId}"."comments"("answerId");
    CREATE INDEX "comments_authorId_idx" ON "${schemaId}"."comments"("authorId");
    CREATE INDEX "comments_createdAt_idx" ON "${schemaId}"."comments"("createdAt");
    CREATE INDEX "comments_questionId_createdAt_idx" ON "${schemaId}"."comments"("questionId", "createdAt");
    CREATE INDEX "comments_answerId_createdAt_idx" ON "${schemaId}"."comments"("answerId", "createdAt");

    CREATE TABLE "${schemaId}"."attachments" (
      "id" varchar(36) PRIMARY KEY,
      "title" text NOT NULL,
      "link" text NOT NULL,
      "questionId" varchar(36) REFERENCES "${schemaId}"."questions"("id") ON DELETE CASCADE,
      "answerId" varchar(36) REFERENCES "${schemaId}"."answers"("id") ON DELETE CASCADE,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone
    );
    CREATE INDEX "attachments_questionId_idx" ON "${schemaId}"."attachments"("questionId");
    CREATE INDEX "attachments_answerId_idx" ON "${schemaId}"."attachments"("answerId");
    CREATE INDEX "attachments_createdAt_idx" ON "${schemaId}"."attachments"("createdAt");
    CREATE INDEX "attachments_questionId_createdAt_idx" ON "${schemaId}"."attachments"("questionId", "createdAt");
    CREATE INDEX "attachments_answerId_createdAt_idx" ON "${schemaId}"."attachments"("answerId", "createdAt");

    CREATE TABLE "${schemaId}"."refresh_tokens" (
      "id" varchar(36) PRIMARY KEY,
      "userId" varchar(36) NOT NULL REFERENCES "${schemaId}"."users"("id"),
      "expiresAt" timestamp with time zone NOT NULL,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
    );
    CREATE INDEX "refresh_tokens_userId_idx" ON "${schemaId}"."refresh_tokens"("userId");
    CREATE INDEX "refresh_tokens_expiresAt_idx" ON "${schemaId}"."refresh_tokens"("expiresAt");

    CREATE TABLE "${schemaId}"."email_validations" (
      "id" varchar(36) PRIMARY KEY,
      "email" text NOT NULL UNIQUE,
      "code" text NOT NULL,
      "expiresAt" timestamp with time zone NOT NULL,
      "isVerified" boolean NOT NULL DEFAULT false,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX "email_validations_email_idx" ON "${schemaId}"."email_validations"("email");
    CREATE INDEX "email_validations_createdAt_idx" ON "${schemaId}"."email_validations"("createdAt");
  `
}

let schemaId: string
let cleanupPool: Pool

beforeAll(async () => {
  schemaId = randomUUID()
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  process.env.DATABASE_URL = databaseURL

  const baseDatabaseURL = databaseURL.replace(/\?schema=.*$/, '')
  const setupPool = new Pool({ connectionString: baseDatabaseURL })

  await setupPool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
  await setupPool.query(generateCreateTablesSql(schemaId))
  await setupPool.end()

  cleanupPool = new Pool({ connectionString: baseDatabaseURL })
})

afterAll(async () => {
  if (cleanupPool) {
    await cleanupPool.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
    await cleanupPool.end()
  }
})
